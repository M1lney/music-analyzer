import sys

def analyze_audio(file_path):
    return f"Analyzing {file_path}..."

if __name__ == '__main__':
    file_path = sys.argv[1]
    print(analyze_audio(file_path))