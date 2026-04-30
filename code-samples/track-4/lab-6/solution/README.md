# Lab 4.6 solution

Reference implementation of the five test categories. Same layout as the
starter; every TODO is filled in.

Run from this directory:

```bash
RECORD_CASSETTES=1 ANTHROPIC_API_KEY=sk-ant-... pytest    # one-time recording
pytest                                                    # subsequent runs from cassette
LIVE=1 ANTHROPIC_API_KEY=sk-ant-... pytest                # bypass cassette, hit the API
```

Try the lab first, then compare.
