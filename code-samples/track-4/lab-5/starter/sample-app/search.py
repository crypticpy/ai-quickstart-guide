from db import all_records


def search_and_format(last_name, case_type, status, sort_by, page, page_size):
    # This function does too much. Filtering, sorting, pagination, and
    # presentation are all tangled together. Lab task 3 asks you to refactor it.
    rows = all_records()
    out = []
    for r in rows:
        keep = True
        if last_name:
            if last_name.lower() not in r["last_name"].lower():
                keep = False
        if case_type:
            if r["case_type"] != case_type:
                keep = False
        if status:
            if r["status"] != status:
                keep = False
        if keep:
            out.append(r)
    # sort
    if sort_by == "last_name":
        out2 = []
        for r in out:
            out2.append(r)
        out2.sort(key=lambda x: x["last_name"])
        out = out2
    elif sort_by == "opened_on":
        out2 = []
        for r in out:
            out2.append(r)
        out2.sort(key=lambda x: x["opened_on"])
        out = out2
    elif sort_by == "id":
        out2 = []
        for r in out:
            out2.append(r)
        out2.sort(key=lambda x: x["id"])
        out = out2
    # paginate
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10
    start = (page - 1) * page_size
    end = start + page_size
    page_rows = out[start:end]
    # format for display
    formatted = []
    for r in page_rows:
        line = (
            "#"
            + str(r["id"])
            + " "
            + r["last_name"]
            + ", "
            + r["first_name"]
            + " ["
            + r["case_type"]
            + "/"
            + r["status"]
            + "] opened "
            + r["opened_on"]
        )
        formatted.append({"id": r["id"], "display": line, "row": r})
    return {"count": len(out), "page": page, "page_size": page_size, "results": formatted}
