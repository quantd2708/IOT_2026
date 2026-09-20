from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def dashboard(request):
    return Response({
        "message": "Ket noi Django thanh cong!",
        "temperature": 28.5,
        "humidity": 65,
        "light": 450
    })