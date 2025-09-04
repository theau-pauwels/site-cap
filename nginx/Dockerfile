FROM nginx:1.25
# Supprime la conf par défaut ("Welcome to nginx!")
RUN rm -f /etc/nginx/conf.d/default.conf
# Comme le build context est ./nginx, on copie le fichier présent dans ce dossier:
COPY nginx.conf /etc/nginx/nginx.conf
