#!/bin/bash
# general note: the $SUDO_USER logic is surrounding all the commands that *shouldn't* be run as root ($SUDO_USER stores the name of the non-sudo user underneath the original sudo call)


# react-scripts setup (this will probably only run once)

if [ ! -d node_modules/react-scripts ]
then

    if [ "$EUID" -ne 0 ]
    then
	echo "Root privileges needed for node update; try running with sudo."
	exit
    fi
    
    npm install -g n && n lts && n latest
    sudo -u $SUDO_USER npm install --force
fi


# delivery repo setup (this will probably only run once)

if [ ! -d delivery ]
then

    if [ "$EUID" -ne 0 ]
    then
	mkdir delivery
	cd delivery
	git init
	git remote add origin root@198.199.81.89:/var/www/html/bare-repo
	
	if [ $(git branch --show-current) != 'main' ]
	then git branch -m master main
	fi
	git pull origin main

    else
	sudo -u $SUDO_USER mkdir delivery
	cd delivery
	sudo -u $SUDO_USER git init
	sudo -u $SUDO_USER git remote add origin root@198.199.81.89:/var/www/html/bare-repo
	
	if [ $(git branch --show-current) != 'main' ]	  
	then sudo -u $SUDO_USER git branch -m master main
	fi
	sudo -u $SUDO_USER git pull origin main
    fi

    cd ..
fi


# actual deployment (most of the time, this is the only block that will run)

if [ "$EUID" -ne 0 ]
then npm run build
else sudo -u $SUDO_USER npm run build
fi

cd delivery && git pull origin main && cd .. # in case the most recent build came from another machine
rm -r delivery/static
mv -v build/* delivery/
rm -r build
cd delivery && git add . && git commit -m 'automated deployment of new build'

if [ "$EUID" -ne 0 ]
then git push origin main
else sudo -u $SUDO_USER git push origin main
fi
