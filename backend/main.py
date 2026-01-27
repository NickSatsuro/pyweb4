import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DB_FILE = "glossary.json"

app = FastAPI(
    title="Accessibility Glossary API",
    description="API для глоссария терминов по веб-доступности",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://83.166.253.97:3000",
        "http://83.166.253.97:5173",
        "http://83.166.253.97",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TermRelation(BaseModel):
    term_id: int
    relationship: str = "" # Например: "является частью"

class TermBase(BaseModel):
    keyword: str
    definition: str
    source: Optional[str] = None
    related_terms: List[TermRelation] = [] 

class Term(TermBase):
    id: int

def load_data() -> List[dict]:
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_data(data: List[dict]):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.get("/api/terms", response_model=List[Term])
def get_terms():
    return load_data()

@app.get("/api/terms/{term_id}", response_model=Term)
def get_term(term_id: int):
    data = load_data()
    term = next((item for item in data if item["id"] == term_id), None)
    if not term:
        raise HTTPException(status_code=404, detail="Term not found")
    return term

@app.post("/api/terms", response_model=Term)
def create_term(term: TermBase):
    data = load_data()
    
    new_id = 1
    if data:
        new_id = max(item["id"] for item in data) + 1
    
    new_term = term.dict()
    new_term["id"] = new_id
    
    data.append(new_term)
    save_data(data)
    return new_term

@app.put("/api/terms/{term_id}", response_model=Term)
def update_term(term_id: int, updated_term: TermBase):
    data = load_data()
    
    for index, item in enumerate(data):
        if item["id"] == term_id:
            data[index] = updated_term.dict()
            data[index]["id"] = term_id
            save_data(data)
            return data[index]
            
    raise HTTPException(status_code=404, detail="Term not found")

@app.delete("/api/terms/{term_id}")
def delete_term(term_id: int):
    data = load_data()
    
    new_data = [item for item in data if item["id"] != term_id]
    
    if len(new_data) == len(data):
        raise HTTPException(status_code=404, detail="Term not found")
    
    # Очистка связей: проходим по всем терминам и удаляем упоминания удаленного ID
    for item in new_data:
        # Оставляем только те связи, где term_id НЕ равен удаляемому
        original_links = item.get("related_terms", [])
        cleaned_links = [
            link for link in original_links 
            if link["term_id"] != term_id
        ]
        item["related_terms"] = cleaned_links

    save_data(new_data)
    return {"message": "Term deleted successfully"}

@app.get("/api/graph")
def get_graph_data():
    """
    Преобразует данные для графа.
    """
    data = load_data()
    
    nodes = []
    links = []
    
    for item in data:
        nodes.append({
            "id": item["id"],
            "name": item["keyword"],
            "desc": item["definition"] 
        })
        
        for relation in item.get("related_terms", []):
            links.append({
                "source": item["id"],
                "target": relation["term_id"],
                "label": relation["relationship"] 
            })
            
    return {"nodes": nodes, "links": links}