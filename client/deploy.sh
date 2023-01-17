#!/bin/bash

if [ ! -d delivery ]
then
    mkdir delivery
    cd delivery
    git init
    git	remote add origin root@198.199.81.89:/var/www/html/bare-repo
fi

npm run build
rm -r delivery/static
mv -v build/* delivery/
rm -r build
cd delivery
git add .
git commit -m 'automated deployment of new build'
git push origin main
