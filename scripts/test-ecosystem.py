import os
import sys
import json
import subprocess
import py_compile
import time
from pathlib import Path

ECOSYSTEM_ROOT = Path(r"C:\AI_Ecosystem")

CATEGORIES = [
    "agents",
    "automation",
    "code-intelligence",
    "harnesses",
    "media-generation",
    "memory-and-context",
    "skills-and-reach",
    "trading"
]

def check_git(repo_path: Path):
    git_dir = repo_path / ".git"
    if not git_dir.exists():
        return {"is_git": False, "branch": "N/A", "commit": "N/A", "status": "Local non-git"}
    try:
        res = subprocess.run(
            ["git", "-C", str(repo_path), "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=5
        )
        branch = res.stdout.strip() if res.returncode == 0 else "unknown"
        res2 = subprocess.run(
            ["git", "-C", str(repo_path), "rev-parse", "--short", "HEAD"],
            capture_output=True, text=True, timeout=5
        )
        commit = res2.stdout.strip() if res2.returncode == 0 else "unknown"
        return {"is_git": True, "branch": branch, "commit": commit, "status": "Git repo OK"}
    except Exception as e:
        return {"is_git": True, "branch": "error", "commit": "error", "status": str(e)}

def check_package_json(repo_path: Path):
    pj = repo_path / "package.json"
    if not pj.exists():
        return None
    try:
        with open(pj, "r", encoding="utf-8") as f:
            data = json.load(f)
        name = data.get("name", "unnamed")
        version = data.get("version", "unknown")
        scripts = list(data.get("scripts", {}).keys())
        return {"valid": True, "name": name, "version": version, "scripts": scripts}
    except Exception as e:
        return {"valid": False, "error": str(e)}

def check_python_syntax(repo_path: Path, max_files=100):
    py_files = list(repo_path.rglob("*.py"))
    # Filter out hidden or build dirs
    filtered = [
        p for p in py_files 
        if not any(part.startswith(".") or part in ("node_modules", "dist", "build", "__pycache__") for part in p.parts)
    ]
    if not filtered:
        return {"checked": 0, "errors": [], "total_py": 0}
    
    sample = filtered[:max_files]
    errors = []
    for p in sample:
        try:
            py_compile.compile(str(p), doraise=True)
        except py_compile.PyCompileError as e:
            errors.append(f"{p.name}: {e.msg}")
        except Exception as e:
            errors.append(f"{p.name}: {str(e)}")
            
    return {
        "checked": len(sample),
        "total_py": len(filtered),
        "errors": errors
    }

def check_skills(repo_path: Path):
    skills = list(repo_path.rglob("SKILL.md"))
    valid_skills = 0
    invalid_skills = []
    for s in skills:
        try:
            content = s.read_text(encoding="utf-8", errors="ignore")
            if len(content.strip()) > 10:
                valid_skills += 1
            else:
                invalid_skills.append(str(s.relative_to(repo_path)))
        except Exception as e:
            invalid_skills.append(str(s.relative_to(repo_path)))
    return {"total_skills": len(skills), "valid": valid_skills, "invalid": invalid_skills}

def test_repo(category: str, repo_name: str, repo_path: Path):
    t0 = time.time()
    git_info = check_git(repo_path)
    pj_info = check_package_json(repo_path)
    py_info = check_python_syntax(repo_path)
    skills_info = check_skills(repo_path)
    
    # Custom functional checks
    custom_status = "OK"
    custom_details = []
    
    if (repo_path / "pyproject.toml").exists():
        custom_details.append("pyproject.toml")
    if (repo_path / "requirements.txt").exists():
        custom_details.append("requirements.txt")
    if (repo_path / "Cargo.toml").exists():
        custom_details.append("Cargo.toml")
    if (repo_path / "docker-compose.yml").exists() or (repo_path / "docker").exists():
        custom_details.append("docker")
        
    duration = round(time.time() - t0, 2)
    
    # Overall pass/fail determination
    status = "PASS"
    issues = []
    
    if py_info["errors"]:
        status = "WARN"
        issues.append(f"{len(py_info['errors'])} py_compile errors")
    if pj_info and not pj_info["valid"]:
        status = "FAIL"
        issues.append(f"Invalid package.json: {pj_info.get('error')}")
    if skills_info["invalid"]:
        status = "WARN"
        issues.append(f"{len(skills_info['invalid'])} empty/invalid SKILL.md")
        
    return {
        "category": category,
        "name": repo_name,
        "path": str(repo_path),
        "status": status,
        "issues": issues,
        "git": git_info,
        "package_json": pj_info,
        "python_syntax": py_info,
        "skills": skills_info,
        "config_files": custom_details,
        "duration_sec": duration
    }

def main():
    print(f"Starting audit and test of AI Ecosystem at {ECOSYSTEM_ROOT}...")
    results = []
    for cat in CATEGORIES:
        cat_dir = ECOSYSTEM_ROOT / cat
        if not cat_dir.is_dir():
            print(f"Warning: Category directory {cat} does not exist.")
            continue
        for repo_dir in cat_dir.iterdir():
            if repo_dir.is_dir() and not repo_dir.name.startswith("."):
                print(f"Testing [{cat}] {repo_dir.name}...", end="", flush=True)
                res = test_repo(cat, repo_dir.name, repo_dir)
                results.append(res)
                print(f" -> {res['status']} ({res['duration_sec']}s)")
                
    output_file = ECOSYSTEM_ROOT / "test_results.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\nCompleted test of {len(results)} repositories. Saved results to {output_file}.")

if __name__ == "__main__":
    main()
