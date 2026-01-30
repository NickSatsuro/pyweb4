import grpc
from concurrent import futures
import glossary_pb2
import glossary_pb2_grpc
from data_utils import load_data

class GlossaryService(glossary_pb2_grpc.GlossaryServiceServicer):
    
    def GetTerms(self, request, context):
        """Возвращает полный список терминов"""
        data = load_data()
        
        # Нам нужно явно преобразовать список dict в список объектов Term
        proto_terms = []
        for item in data:
            # Создаем объект TermRelation для каждого вложенного элемента
            relations = [
                glossary_pb2.TermRelation(
                    term_id=r["term_id"], 
                    relationship=r["relationship"]
                ) for r in item.get("related_terms", [])
            ]
            
            # Создаем объект Term
            term_obj = glossary_pb2.Term(
                id=item["id"],
                keyword=item["keyword"],
                definition=item["definition"],
                source=item.get("source") or "", # Protobuf не любит None, лучше пустую строку
                related_terms=relations
            )
            proto_terms.append(term_obj)

        return glossary_pb2.TermListResponse(terms=proto_terms)

    def GetTerm(self, request, context):
        """Возвращает один термин по ID"""
        data = load_data()
        term_id = request.id
        
        # Ищем элемент (аналог next(...) в твоем main.py)
        item = next((i for i in data if i["id"] == term_id), None)
        
        if item is None:
            context.abort(grpc.StatusCode.NOT_FOUND, "Term not found")
            
        # Преобразуем найденный dict в Protobuf
        relations = [
            glossary_pb2.TermRelation(term_id=r["term_id"], relationship=r["relationship"]) 
            for r in item.get("related_terms", [])
        ]
        
        term_obj = glossary_pb2.Term(
            id=item["id"],
            keyword=item["keyword"],
            definition=item["definition"],
            source=item.get("source") or "",
            related_terms=relations
        )
        
        return glossary_pb2.TermResponse(term=term_obj)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    glossary_pb2_grpc.add_GlossaryServiceServicer_to_server(GlossaryService(), server)
    
    server.add_insecure_port('[::]:50051')
    print("gRPC server started on port 50051")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()