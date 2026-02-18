from django.shortcuts import render
from django.http import JsonResponse
from .models import Score
import json
import random

# Create your views here.
def home(request):
    paragraphs = [
        "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design.",
        "In the world of software engineering, the best code is the code that is easy to read and maintain.",
        "Bengaluru is known as the Silicon Valley of India, a hub for technology and innovation."
    ]
    
    # Pick a random paragraph
    random_text = random.choice(paragraphs)
    
    # Fetch leaderboard
    leaderboard = Score.objects.order_by('-wpm')[:5]
    
    return render(request, 'speedtest/index.html', {
        'random_text': random_text, 
        'leaderboard': leaderboard
    })

def save_score(request):
    if request.method == "POST":
        data = json.loads(request.body)
        
        # Create the record in MySQL
        Score.objects.create(
            username=data.get('username', 'Anonymous'),
            wpm=data.get('wpm'),
            accuracy=data.get('accuracy')
        )
        
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'}, status=400)