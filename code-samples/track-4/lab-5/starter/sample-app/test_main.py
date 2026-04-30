from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# The tasks in tasks.md ask you to add tests for:
#   - find_by_last_name
#   - the refactored search functions (filter, sort, paginate)
#   - the SQL injection regression
#   - the new pagination feature
