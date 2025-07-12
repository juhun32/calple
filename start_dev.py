#!/usr/bin/env python3

import subprocess
import time
import sys
import os
import signal
from pathlib import Path


def run_command(name, command, cwd=None, env=None):
    """Run a command and return the process"""
    print(f"Starting {name}...")

    process_env = os.environ.copy()
    if env:
        process_env.update(env)

    try:
        process = subprocess.Popen(
            command,
            shell=True,
            cwd=cwd,
            env=process_env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        return process
    except Exception as e:
        print(f"Error starting {name}: {e}")
        return None


def main():
    print("Starting Calple Development Environment...")
    print("=" * 50)

    processes = []

    try:
        frontend_process = run_command(
            "Frontend (Next.js)",
            "npm run dev",
            cwd="frontend"
        )
        if frontend_process:
            processes.append(("Frontend", frontend_process))

        firebase_process = run_command(
            "Firebase Emulators",
            "firebase emulators:start --project calple-db",
            cwd="frontend/lib/firebase"
        )
        if firebase_process:
            processes.append(("Firebase", firebase_process))

        print("Waiting for Firebase to initialize...")
        time.sleep(3)

        go_env = {"FIRESTORE_EMULATOR_HOST": "localhost:8080"}
        go_process = run_command(
            "Go Backend",
            "go run cmd/main.go",
            cwd="go",
            env=go_env
        )
        if go_process:
            processes.append(("Go Backend", go_process))

        print("Next.js frontend: http://localhost:3000")
        print("Firebase emulators: http://localhost:4000")
        print("Go backend: http://localhost:8080")
        print("\nPress Ctrl+C to stop all services")
        print("=" * 50)

        while processes:
            for name, process in processes[:]:
                if process.poll() is not None:
                    print(f"{name} has stopped (exit code: {process.returncode})")
                    processes.remove((name, process))
                    continue

                try:
                    output = process.stdout.readline()
                    if output:
                        print(f"[{name}] {output.strip()}")
                except:
                    pass

            time.sleep(0.1)

    except KeyboardInterrupt:
        print("\nStopping all services...")

        for name, process in processes:
            print(f"Stopping {name}...")
            try:
                process.terminate()
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                print(f"Force killing {name}...")
                process.kill()
            except Exception as e:
                print(f"Error stopping {name}: {e}")

        print("All services stopped.")

    except Exception as e:
        print(f"Error: {e}")

        for name, process in processes:
            try:
                process.terminate()
            except:
                pass


if __name__ == "__main__":
    main()
