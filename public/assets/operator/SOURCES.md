# Human operator asset

Source: Microsoft Rocketbox Avatar Library, Male Adult 07 (m013).
Repository: https://github.com/microsoft/Microsoft-Rocketbox
Source model: Assets/Avatars/Adults/Male_Adult_07/Export/Male_Adult_07_facial.fbx
Textures: Assets/Avatars/Adults/Male_Adult_07/Textures/
License: MIT. Copyright (c) 2020 Microsoft. Full notice: LICENSE.txt in this folder.

Adaptations for Operation Riyaz:
- Converted FBX and TGA assets to one self-contained glTF 2.0 binary.
- Converted source materials to physically based skin, clothing and cutout hair materials.
- Resized body/hair maps to 1024px, head color to 2048px and normal maps to 1024px.
- Kept the 81-bone skeleton and two eyelid blink targets; removed unused facial targets and clips.
- Runtime skeletal posing fits the existing chair, keyboard, typing, recoil and projection stages.

The character is a fictional lab operator and does not depict portfolio subject Shaik Riyaz.
Rebuild with the Vite development server on port 4173:
  node scripts/convert-operator.mjs --download --export
The source downloads remain in the ignored .asset-work/rocketbox folder and are not shipped.
