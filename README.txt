QuickAns (offline) - how to build the APK
=========================================

This version has no Google Drive, no Google sign-in, no ID-card login, no cloud backup and no "Drivi" or "Momo".
Nothing from your phone is uploaded anywhere. History is saved only on the phone.

Offline mode (books, typed questions, formulas, reading photos with on-device text recognition) needs no internet at all.
The Online tab still needs internet and your own free key (Gemini / Groq / OpenRouter), because it asks those AI services.
It only connects when you tap Get answers there.

Build (same as before, no setup files needed):
1. Upload everything from this folder to your GitHub repository (include the hidden .github folder).
2. Actions > Build APK > Run workflow.
3. Download QuickAns-apk from the finished run, unzip it, install app-debug.apk.
If Android says "App not installed", uninstall the old QuickAns first, then install this one.

If you ever built an older version with real Google credentials in accounts.txt: those were inside the old APKs.
Remove the app's access at myaccount.google.com/permissions and delete the OAuth client in Google Cloud.
