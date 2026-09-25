import re
import codecs

def fix_file(filepath):
    with codecs.open(filepath, 'r', 'utf-8') as f:
        content = f.read()

    # SessionPage.tsx fixes
    content = re.sub(r"useState<'[^']+' \| '[^']+' \| null>\(null\)", "useState<'CỐ ĐỊNH' | 'VÃNG LAI' | null>(null)", content)
    content = re.sub(r"setPendingSessionType\('[^']+'\)", lambda m: "setPendingSessionType('CỐ ĐỊNH')" if "NH" in m.group(0) else "setPendingSessionType('VÃNG LAI')", content)
    content = re.sub(r"pendingSessionType === '[^']+'", lambda m: "pendingSessionType === 'CỐ ĐỊNH'" if "NH" in m.group(0) else "pendingSessionType === 'VÃNG LAI'", content)

    # useSession.ts fixes
    content = re.sub(r"sessionType: '[^']+' \| '[^']+' = '[^']+'", "sessionType: 'CỐ ĐỊNH' | 'VÃNG LAI' = 'CỐ ĐỊNH'", content)

    with codecs.open(filepath, 'w', 'utf-8') as f:
        f.write(content)

fix_file('src/pages/SessionPage.tsx')
fix_file('src/hooks/useSession.ts')
