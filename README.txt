ICA central content widget — GitHub Pages

Upload the CONTENTS of this folder to the repository publishing root.
In GitHub: Settings → Pages → Deploy from a branch → main → /(root) → Save.
The widget URL will be https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/ (including the trailing slash).
For a user site, it may instead be https://YOUR-USERNAME.github.io/.
Set that URL as Widget URL in the ICA Widget Webhook preset in Bloomreach.
The form works from a project subpath; no domain-root resource paths are required.

This package contains static demo content, layout, styles and widget protocol code only. It contains no customer profiles, API key, API secret or Python server.
Opening the Pages URL directly provides a preview and browser draft saving. It cannot write to Bloomreach directly. The preset executes the Catalog API write from Bloomreach using its configured authentication integration.
The embedded form accepts parent messages only from https://app.exponea.com, https://demoapp.exponea.com or https://demoapp.bloomreach.com. Add your exact official Bloomreach origin to allowedOrigins if it differs.

IN BLOOMREACH
Data & Assets → Integrations → Webhook preset → Widget Webhook.
Name: ICA · Publish central campaign content.
Widget URL: the published Pages URL above.
Configure the existing ICA Catalog API Basic credentials in a Bloomreach authentication integration. Keep them out of this repository and widget configuration files.
Add the preset to a draft scenario scoped to one dedicated control profile. Done saves the form values; running the webhook publishes them. Test is a REAL catalog write. The API may acknowledge a queued update before the content becomes visible.
Verify the actual saved preset authentication and catalog readback before using it in the demo. Hosting and native registration have not been performed by this package builder.
Do not enable a customer email-send scenario as part of hosting this form.
