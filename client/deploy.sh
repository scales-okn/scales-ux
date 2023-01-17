npm run build && rm -r delivery/static && mv -v build/* delivery/ && rm -r build && cd delivery && git add . && git commit -m 'automated deployment of new build' && git push origin main
