content = open(r'e:\Projets_Cornerstone\site_crnstneros\capril_\native_apps\locataire\components\KycVerificationModal.tsx', encoding='utf-8').read()
fake = content.count('capture://recto') + content.count('capture://verso') + content.count('capture://selfie')
print('Fake URIs remaining:', fake)
print('behavior padding count:', content.count('behavior='))
print('paddingBottom 32 count:', content.count('paddingBottom: 32'))
print('keyboardVerticalOffset 80:', content.count(': 80}'))
print('Total lines:', content.count('\n'))

