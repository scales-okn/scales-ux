pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                echo  'Starting!'
                sh 'ls'
                sh 'docker build -t satyrn-ux . --network=host'
                echo 'Docker build complete'
            }
        }

        stage('Push') {
            steps{
                sh 'aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 304793330600.dkr.ecr.us-east-1.amazonaws.com'
                echo  'Logged into ECR'
                sh 'docker tag satyrn-ux:latest 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:latest'
                sh 'docker push 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:latest'
                sh 'docker tag satyrn-ux:latest 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:$BUILD_NUMBER'
                sh 'docker push 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:$BUILD_NUMBER'
            }
        }

        stage('Deploy') {
            steps {
                sh 'helm upgrade --install satyrn-ux charts/generic --values charts/satyrn-ux/values-override.yaml --create-namespace --namespace dev-satyrn-ux --set image.tag=$BUILD_NUMBER'
            }
        }
    }
}
