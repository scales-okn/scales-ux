#!/bin/bash
# general note: the $SUDO_USER logic is surrounding all the commands that *shouldn't* be run as root ($SUDO_USER stores the name of the non-sudo user underneath the original sudo call)

if [ $1 == 'qa' ]; then
    ip='161.35.51.17'
    delivery_dir='delivery_qa'
elif [ $1 == 'prod' ]; then
    ip='198.199.81.89'
    delivery_dir='delivery'
else
    echo "Please specify 'qa' or 'prod' as a command-line argument."
    exit 2
fi


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

if [ ! -d $delivery_dir ]
then

    if [ "$EUID" -ne 0 ]; then
	mkdir $delivery_dir
	cd $delivery_dir
	git init
	git remote add origin root@$ip:/var/www/html/bare-repo
	
	if [ $(git branch --show-current) != 'main' ]
	then git branch -m master main
	fi
	git pull origin main

    else
	sudo -u $SUDO_USER mkdir $delivery_dir
	cd $delivery_dir
	sudo -u $SUDO_USER git init
	sudo -u $SUDO_USER git remote add origin root@$ip:/var/www/html/bare-repo
	
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

cd $delivery_dir && git pull origin main && cd .. # in case the most recent build came from another machine
rm -r $delivery_dir/static
mv -v build/* $delivery_dir/
rm -r build
cd $delivery_dir && git add . && git commit -m 'automated deployment of new build'

if [ "$EUID" -ne 0 ]
then git push origin main
else sudo -u $SUDO_USER git push origin main
fi
