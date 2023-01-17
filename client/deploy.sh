#!/bin/bash


# react-scripts setup

if [ ! -d node_modules/react-scripts ]
then

    if [ "$EUID" -ne 0 ]
    then
	echo "Root privileges needed for node update; try running with sudo."
	exit
    fi
    
    npm install -g n && n lts && n latest
    npm install --force
fi


# delivery repo setup

if [ ! -d delivery ]
then

    if [ "$EUID" -ne 0 ]
    then
	mkdir delivery
	cd delivery
	git init
	git remote add origin root@198.199.81.89:/var/www/html/bare-repo
	git branch -m master main

    else
	sudo -u $SUDO_USER mkdir delivery
	sudo -u $SUDO_USER cd delivery
	sudo -u $SUDO_USER git init
	sudo -u $SUDO_USER git remote add origin root@198.199.81.89:/var/www/html/bare-repo
	sudo -u $SUDO_USER git branch -m master main
    fi
    
    cd ..
fi


# actual deployment

npm run build
rm -r delivery/static
mv -v build/* delivery/
rm -r build
cd delivery
git add .
git commit -m 'automated deployment of new build'
git push origin main
