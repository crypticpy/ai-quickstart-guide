# policy_classifier

A reusable constituent-message classifier built around a single port.

```python
from policy_classifier import make_classifier

classifier = make_classifier(strategy="structured")
result = classifier.classify("There is a pothole on Maple Street.")
print(result.label, result.confidence)
```

## What's inside

- `ports.py`. The `Classifier` abstract base class and the
  `ClassificationResult` dataclass. The contract every adapter must
  satisfy.
- `adapters/`. Concrete adapters: zero-shot, few-shot, structured-output.
  All three call Anthropic Claude. Adding a new provider is a new
  adapter, not a code change anywhere else.
- `factory.py`. `make_classifier(strategy=...)`. Consumers ask for a
  strategy by name; they never import an adapter directly.
- `tests/test_contract.py`. Runs against any `Classifier` instance.
- `tests/test_integration.py`. Same shape, runs against the live API.
