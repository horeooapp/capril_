#!/usr/bin/env python3
"""Fix keyboard avoiding behavior in KYC modals for both apps."""

APPS = ['locataire', 'proprietaire']
BASE = r'e:\Projets_Cornerstone\site_crnstneros\capril_\native_apps'

# Fix 1: KeyboardAvoidingView - use 'padding' on both platforms, proper offset
OLD_KAV = "        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}\n        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}"
NEW_KAV = "        behavior=\"padding\"\n        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}"

# Fix 2: All ScrollView in steps - add contentContainerStyle padding bottom
# Already have keyboardShouldPersistTaps="handled" - add paddingBottom to contentContainerStyle
# The existing style is: contentContainerStyle={styles.content}
# We need to merge extra paddingBottom

# Fix 3: container style - ensure it doesn't have fixed maxHeight that cuts off
# Check styles.container

for app in APPS:
    path = rf'{BASE}\{app}\components\KycVerificationModal.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changed = 0
    
    # Fix KeyboardAvoidingView behavior
    if OLD_KAV in content:
        content = content.replace(OLD_KAV, NEW_KAV)
        changed += 1
        print(f'{app}: fixed KeyboardAvoidingView behavior')
    else:
        print(f'{app}: KAV pattern not found (may already be fixed)')
    
    # Fix: TouchableWithoutFeedback wraps the overlay but the KAV needs to be OUTSIDE it
    # The issue: TouchableWithoutFeedback + View overlay + View container
    # When keyboard appears on Android with behavior=height, the container shrinks
    # With behavior=padding, the container gets padded from bottom - correct!
    
    # Also fix: ScrollView contentContainerStyle should have paddingBottom to avoid
    # last input being hidden behind keyboard
    # Replace styles.content with inline style that adds paddingBottom
    OLD_SCROLL = "contentContainerStyle={styles.content} keyboardShouldPersistTaps=\"handled\""
    NEW_SCROLL = "contentContainerStyle={[styles.content, { paddingBottom: 32 }]} keyboardShouldPersistTaps=\"handled\""
    
    count_scroll = content.count(OLD_SCROLL)
    if count_scroll > 0:
        content = content.replace(OLD_SCROLL, NEW_SCROLL)
        changed += count_scroll
        print(f'{app}: fixed {count_scroll} ScrollView paddingBottom')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'{app}: {changed} changes applied -> OK')

print('Done.')

