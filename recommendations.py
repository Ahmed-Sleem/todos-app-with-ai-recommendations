import sys
import google.generativeai as genai
import os

def get_recommendations(todoitem):

     # Get the absolute path to the directory of the Python script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    api_key_file = os.path.join(script_dir, "api-key.txt")

    # Check if the api-key.txt file exists
    if not os.path.exists(api_key_file):
        print("API key file 'api-key.txt' does not exist.")
        return "No API key available"

    # Load API key from file or configuration settings
    with open("api-key.txt", "r") as file:
        apikey = file.read()
        apikey = str(apikey)
        
    genai.configure(api_key=apikey)
    model = genai.GenerativeModel('gemini-1.5-flash')

    prompt = f"""
I will provide you with a todo list item from my todo list and I need you to give me a recommendation like a website url or something that can help me with this todo item to be done,
this recommendation must be useful and in friendly tone and summarized. 
My todo item: "{todoitem}"
"""
    
    response = model.generate_content(prompt)

    if response and response.text:
        return response.text
    return "No recommendation available"

# Accept todo item content from command line argument
if __name__ == "__main__":
    if len(sys.argv) > 1:
        todo_content = sys.argv[1]
        recommendations = get_recommendations(todo_content)
        print(recommendations)
    else:
        print("No todo item provided")




