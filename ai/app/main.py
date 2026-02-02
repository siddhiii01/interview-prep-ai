from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI"}



# python -m venv venv
# venv\Scripts\activate
# pip install fastapi
# pip install uvicorn
# uvicorn main:app --reload



