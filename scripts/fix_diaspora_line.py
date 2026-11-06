with open("src/app/dashboard/(portal)/diaspora/diaspora-client.tsx", "r", encoding="utf-8") as f:
    c = f.read()

lines = c.splitlines()
if "toast" in lines[0] and "use client" in lines[1]:
    lines[0] = '"use client"\n'
    lines[1] = 'import { toast } from "sonner";'
    with open("src/app/dashboard/(portal)/diaspora/diaspora-client.tsx", "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("diaspora-client.tsx fixed successfully!")
else:
    print("Line 0:", repr(lines[0]))
    print("Line 1:", repr(lines[1]))

