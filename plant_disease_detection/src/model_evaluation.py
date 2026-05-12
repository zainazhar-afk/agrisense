"""
Model evaluation script for Plant Disease Detection
Tests the trained model and generates comprehensive metrics
"""
import os
import sys
import json
import numpy as np
import tensorflow as tf
import onnxruntime as ort
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    classification_report, 
    confusion_matrix, 
    accuracy_score,
    precision_recall_fscore_support
)

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
import config
from src.data_preprocessing import setup_gpu, create_datasets, load_class_mapping


class ONNXModelWrapper:
    """Minimal Keras-like wrapper around an ONNX Runtime session."""

    def __init__(self, model_path: Path):
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found at {model_path}")

        print(f"📦 Loading ONNX model from {model_path}")
        self.session = ort.InferenceSession(
            str(model_path),
            providers=["CPUExecutionProvider"],
        )
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name
        self.input_shape = self.session.get_inputs()[0].shape
        self.output_shape = self.session.get_outputs()[0].shape

    @staticmethod
    def _softmax_if_needed(values: np.ndarray) -> np.ndarray:
        values = values.astype(np.float32)
        total = float(np.sum(values))
        if np.all(values >= 0) and np.isclose(total, 1.0, atol=1e-3):
            return values

        values = values - np.max(values, axis=-1, keepdims=True)
        exp_values = np.exp(values)
        return exp_values / np.sum(exp_values, axis=-1, keepdims=True)

    def predict(self, images, verbose: int = 0):
        del verbose
        if isinstance(images, tf.Tensor):
            images = images.numpy()

        processed_images = np.asarray(images, dtype=np.float32)
        raw_output = self.session.run(
            [self.output_name],
            {self.input_name: processed_images},
        )[0]
        return self._softmax_if_needed(raw_output)

    def count_params(self):
        return 0


def load_trained_model():
    """Load the trained model"""
    if config.MODEL_H5_PATH.exists():
        print(f"📦 Loading model from {config.MODEL_H5_PATH}")
        model = tf.keras.models.load_model(config.MODEL_H5_PATH)
        print("✓ Model loaded successfully")
        return model

    if config.MODEL_ONNX_PATH.exists():
        model = ONNXModelWrapper(config.MODEL_ONNX_PATH)
        print("✓ Model loaded successfully")
        return model

    raise FileNotFoundError(
        "No trained model found. Expected one of: "
        f"{config.MODEL_H5_PATH} or {config.MODEL_ONNX_PATH}"
    )


def evaluate_model(model, test_ds, class_names):
    """
    Comprehensive model evaluation
    
    Args:
        model: Trained Keras model
        test_ds: Test dataset
        class_names: List of class names
        
    Returns:
        Dictionary with evaluation metrics
    """
    print("\n" + "="*80)
    print("📊 Evaluating Model Performance")
    print("="*80)
    
    # Get predictions and true labels
    print("\n🔄 Generating predictions on test set...")
    y_true = []
    y_pred = []
    y_pred_probs = []
    
    for images, labels in test_ds:
        predictions = model.predict(images, verbose=0)
        y_pred_probs.extend(predictions)
        y_pred.extend(np.argmax(predictions, axis=1))
        y_true.extend(labels.numpy())
    
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    y_pred_probs = np.array(y_pred_probs)
    
    # Calculate metrics
    print("\n📈 Calculating metrics...")
    
    # Overall accuracy
    accuracy = accuracy_score(y_true, y_pred)
    
    # Top-3 accuracy
    top3_accuracy = np.mean([
        1 if true_label in np.argsort(probs)[-3:] else 0
        for true_label, probs in zip(y_true, y_pred_probs)
    ])
    
    # Precision, Recall, F1-Score
    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, y_pred, average='weighted'
    )
    
    # Per-class metrics
    class_report = classification_report(
        y_true, y_pred, 
        target_names=class_names,
        output_dict=True
    )
    
    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    
    # Print results
    print("\n" + "="*80)
    print("📊 EVALUATION RESULTS")
    print("="*80)
    print(f"\n🎯 Overall Metrics:")
    print(f"  - Test Accuracy: {accuracy*100:.2f}%")
    print(f"  - Top-3 Accuracy: {top3_accuracy*100:.2f}%")
    print(f"  - Precision (weighted): {precision:.4f}")
    print(f"  - Recall (weighted): {recall:.4f}")
    print(f"  - F1-Score (weighted): {f1:.4f}")
    
    print(f"\n📋 Per-Class Performance:")
    print("-" * 80)
    print(f"{'Class':<50} {'Precision':<12} {'Recall':<12} {'F1-Score':<12} {'Support'}")
    print("-" * 80)
    
    for class_name in class_names:
        metrics = class_report[class_name]
        print(f"{class_name:<50} {metrics['precision']:<12.4f} {metrics['recall']:<12.4f} "
              f"{metrics['f1-score']:<12.4f} {int(metrics['support'])}")
    
    print("-" * 80)
    
    # Find best and worst performing classes
    f1_scores = {name: class_report[name]['f1-score'] for name in class_names}
    best_class = max(f1_scores, key=f1_scores.get)
    worst_class = min(f1_scores, key=f1_scores.get)
    
    print(f"\n🏆 Best performing class: {best_class} (F1: {f1_scores[best_class]:.4f})")
    print(f"⚠️  Worst performing class: {worst_class} (F1: {f1_scores[worst_class]:.4f})")
    
    # Save results
    results = {
        'accuracy': float(accuracy),
        'top3_accuracy': float(top3_accuracy),
        'precision_weighted': float(precision),
        'recall_weighted': float(recall),
        'f1_weighted': float(f1),
        'per_class_metrics': class_report,
        'confusion_matrix': cm.tolist(),
        'best_class': best_class,
        'worst_class': worst_class,
        'total_test_samples': len(y_true)
    }
    
    return results, cm, y_true, y_pred


def plot_confusion_matrix(cm, class_names, save_path):
    """Plot and save confusion matrix"""
    plt.figure(figsize=(14, 12))
    
    # Normalize confusion matrix
    cm_normalized = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
    
    # Create heatmap
    sns.heatmap(
        cm_normalized,
        annot=True,
        fmt='.2f',
        cmap='Blues',
        xticklabels=class_names,
        yticklabels=class_names,
        cbar_kws={'label': 'Normalized Frequency'}
    )
    
    plt.title('Confusion Matrix (Normalized)', fontsize=16, fontweight='bold', pad=20)
    plt.ylabel('True Label', fontsize=12)
    plt.xlabel('Predicted Label', fontsize=12)
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()
    
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"\n✓ Confusion matrix saved to {save_path}")
    plt.close()


def plot_class_performance(class_report, class_names, save_path):
    """Plot per-class performance metrics"""
    fig, axes = plt.subplots(1, 2, figsize=(16, 6))
    
    # Extract metrics
    precision = [class_report[name]['precision'] for name in class_names]
    recall = [class_report[name]['recall'] for name in class_names]
    f1 = [class_report[name]['f1-score'] for name in class_names]
    
    x = np.arange(len(class_names))
    width = 0.25
    
    # Bar plot
    axes[0].bar(x - width, precision, width, label='Precision', alpha=0.8)
    axes[0].bar(x, recall, width, label='Recall', alpha=0.8)
    axes[0].bar(x + width, f1, width, label='F1-Score', alpha=0.8)
    
    axes[0].set_xlabel('Class', fontsize=10)
    axes[0].set_ylabel('Score', fontsize=10)
    axes[0].set_title('Per-Class Performance Metrics', fontsize=12, fontweight='bold')
    axes[0].set_xticks(x)
    axes[0].set_xticklabels(class_names, rotation=45, ha='right', fontsize=8)
    axes[0].legend()
    axes[0].grid(axis='y', alpha=0.3)
    axes[0].set_ylim([0, 1.1])
    
    # F1-Score comparison
    colors = ['green' if score > 0.9 else 'orange' if score > 0.7 else 'red' for score in f1]
    axes[1].barh(class_names, f1, color=colors, alpha=0.7)
    axes[1].set_xlabel('F1-Score', fontsize=10)
    axes[1].set_title('F1-Score by Class', fontsize=12, fontweight='bold')
    axes[1].set_xlim([0, 1.1])
    axes[1].grid(axis='x', alpha=0.3)
    
    # Add value labels
    for i, v in enumerate(f1):
        axes[1].text(v + 0.02, i, f'{v:.3f}', va='center', fontsize=9)
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"✓ Class performance plot saved to {save_path}")
    plt.close()


def save_evaluation_results(results, save_path):
    """Save evaluation results to JSON"""
    # Convert numpy types to Python types for JSON serialization
    serializable_results = {}
    for key, value in results.items():
        if isinstance(value, np.ndarray):
            serializable_results[key] = value.tolist()
        elif isinstance(value, (np.int64, np.int32)):
            serializable_results[key] = int(value)
        elif isinstance(value, (np.float64, np.float32)):
            serializable_results[key] = float(value)
        else:
            serializable_results[key] = value
    
    with open(save_path, 'w') as f:
        json.dump(serializable_results, f, indent=4)
    
    print(f"✓ Evaluation results saved to {save_path}")


def main():
    """Main evaluation function"""
    print("="*80)
    print("🌱 AgriSense AI - Model Evaluation")
    print("="*80)
    
    # Setup GPU
    setup_gpu()
    
    # Load class mapping
    class_mapping = load_class_mapping()
    class_names = class_mapping['class_names']
    
    # Load model
    model = load_trained_model()
    
    # Print model summary
    print("\n📋 Model Summary:")
    print(f"  - Input shape: {model.input_shape}")
    print(f"  - Output shape: {model.output_shape}")
    print(f"  - Total parameters: {model.count_params():,}")
    
    # Load test dataset
    print("\n📂 Loading test dataset...")
    _, _, test_ds, dataset_info = create_datasets(config.DATA_DIR)
    print(f"  - Test samples: {dataset_info['test_size']}")
    
    # Evaluate model
    results, cm, y_true, y_pred = evaluate_model(model, test_ds, class_names)
    
    # Generate visualizations
    print("\n🎨 Generating visualizations...")
    plot_confusion_matrix(
        cm, 
        class_names, 
        config.MODELS_DIR / "confusion_matrix.png"
    )
    
    plot_class_performance(
        results['per_class_metrics'],
        class_names,
        config.MODELS_DIR / "class_performance.png"
    )
    
    # Save results
    print("\n💾 Saving evaluation results...")
    save_evaluation_results(
        results,
        config.MODELS_DIR / "evaluation_results.json"
    )
    
    print("\n" + "="*80)
    print("✅ Evaluation Complete!")
    print("="*80)
    print(f"\n📁 Results saved in: {config.MODELS_DIR}")
    print("  - evaluation_results.json")
    print("  - confusion_matrix.png")
    print("  - class_performance.png")
    
    return results


if __name__ == "__main__":
    results = main()
