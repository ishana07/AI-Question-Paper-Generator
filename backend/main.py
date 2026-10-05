from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

# Create Gemini client
client = genai.Client()

# Create FastAPI app
app = FastAPI(title="AI Question Paper Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175", "http://127.0.0.1:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request format for generating questions
class QuestionPaperRequest(BaseModel):
    topic: str
    difficulty: str
    num_questions: int
    question_types: list[str]
    study_material: str = ""


@app.get("/")
def home():
    return {
        "message": "AI Question Paper Generator Backend is running!"
    }


@app.post("/generate")
def generate_question_paper(request: QuestionPaperRequest):

    prompt = f"""
You are an expert academic question paper generator.

Generate {request.num_questions} questions using ALL of the study material provided below.

Topic:
{request.topic}

Study Material:
{request.study_material}

Difficulty level:
{request.difficulty}

Question types requested:
{", ".join(request.question_types)}

IMPORTANT MULTI-TOPIC RULES:
- The study material may contain multiple files and multiple topics.
- Use ALL uploaded topics when generating the question paper.
- Create a mixed question paper covering the different topics present in the study material.
- Distribute questions reasonably across the available topics.
- Do not generate questions mainly from only one topic when multiple topics are provided.
- Use the topic labels provided in the study material to identify different topics.
- Do not introduce unrelated topics that are not present in the provided study material.

QUESTION GENERATION RULES:
- Generate exactly {request.num_questions} questions.
- Generate only the requested question types.
- Match the requested difficulty level.
- If Multiple Choice is requested, provide four options labeled A, B, C, and D.
- If Short Answer is requested, generate questions that can be answered in a few sentences.
- If Descriptive is requested, generate detailed analytical or explanatory questions.
- Distribute the requested question types reasonably across the total number of questions.
- Do not provide answers.
- Number the questions from 1 onwards.
- Use plain text only.
- Do not use LaTeX.
- Do not use dollar signs for mathematical notation.
- Do not use Markdown formatting.
- Keep the questions clear and easy to read.

SECTION FORMATTING:
- Organize the output into clear sections based on the requested question types.
- Use the heading "SECTION A - MULTIPLE CHOICE" for Multiple Choice questions.
- Use the heading "SECTION B - SHORT ANSWER" for Short Answer questions.
- Use the heading "SECTION C - DESCRIPTIVE" for Descriptive questions.
- For Multiple Choice questions, place each option on a separate line and label them A, B, C, and D.
"""

    response = client.interactions.create(
        model="gemini-3.5-flash-lite",
        input=prompt
    )

    return {
    "topic": request.topic,
    "difficulty": request.difficulty,
    "num_questions": request.num_questions,
    "question_types": request.question_types,
    "questions": response.output_text
}

class SolutionRequest(BaseModel):
    topic: str
    study_material: str = ""
    question_paper: str


@app.post("/generate-solution")
def generate_solution(request: SolutionRequest):

    prompt = f"""
You are an expert academic answer-key generator.

Create the answer key for the EXACT question paper provided below.

Topic:
{request.topic}

Study Material:
{request.study_material}

Question Paper:
{request.question_paper}

Rules:
- Answer every question in the question paper.
- Do not create new questions.
- Keep the same question numbering.
- For Multiple Choice questions, provide the correct option letter and answer.
- For Short Answer questions, provide concise but complete answers.
- For Descriptive questions, provide well-structured model answers.
- Base answers primarily on the provided study material.
- Do not add unrelated information.
- Use plain text only.
- Do not use Markdown.
- Do not use LaTeX.
- Organize the answers using the same section headings as the question paper.
- Start with the heading "ANSWER KEY".
"""

    response = client.interactions.create(
        model="gemini-3.5-flash-lite",
        input=prompt
    )

    return {
        "solution": response.output_text
    }