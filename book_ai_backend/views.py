from django.http import JsonResponse


def home(request):
    return JsonResponse(
        {
            "message": "Book AI Backend Running",
            "status": "success",
        }
    )
