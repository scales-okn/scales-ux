pipeline {
  // agent any
  agent {
    kubernetes {
      yaml '''
        apiVersion: v1
        kind: Pod
        metadata:
          labels:
            some-label: ux-build-and-test
        spec:
          containers:
          - name: cypress
            image: cypress/base:10
            command:
            - cat
            tty: true
          - name: build
            image: george7522/jenkins-agent:0.02
            command:
            - cat
            volumeMounts:
            - name: docker
              mountPath: /var/lib/docker
            - name: docker-sock
              mountPath: /var/run/docker.sock
            tty: true
            securityContext:
              privileged: true
          volumes:
          - name: docker
            hostPath:
              path: /var/lib/docker
          - name: docker-sock
            hostPath:
              path: /var/run/docker.sock
          securityContext:
            runAsUser: 0
            runAsGroup: 0
          nodeSelector:
            node-group: cicd
        '''
    }
  }
  environment{
      PROXY_API_URL = "https://dev.satyrn.io/api"
      PROXY_API_KEY = credentials('API_KEY')
  }
  stages {
    stage('Checkout Deployment') {
        steps {
            dir("$WORKSPACE/satyrn-deployment") {
                git(
                    branch: 'master',
                    credentialsId: 'github',
                    url: 'git@github.com:nu-c3lab/satyrn-deployment.git'
                )
            }
        }
    }
    stage('Build') {
      steps {
        container('build') {
            withCredentials([file(credentialsId: 'ssh_key', variable: 'keyfile')]){
              echo 'Starting docker build!'
	            sh "set +x ; docker build --build-arg SSH_PRIVATE_KEY=\"\$(cat ${keyfile})\" -t satyrn-ux . --network=host ; set -x"
            }
        }
      }
    }

    stage('Push') {
      steps {
        container('build') {
          echo  'Logging in!'
          sh 'aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 304793330600.dkr.ecr.us-east-1.amazonaws.com'
          sh 'docker tag satyrn-ux:latest 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:latest'
          sh 'docker push 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:latest'
          sh 'docker tag satyrn-ux:latest 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:test-$GIT_COMMIT'
          sh 'docker push 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:test-$GIT_COMMIT'
        }
      }
    }

    stage('Deploy') {
      steps {
        container('build') {
          dir("$WORKSPACE/satyrn-deployment") {
            sh 'helm upgrade --install satyrn-ux ./charts/common --values charts/satyrn-ux/values-override-dev.yaml --set env.PROXY_API_KEY=$PROXY_API_KEY --set env.PROXY_API_URL=$PROXY_API_URL --create-namespace --namespace dev-satyrn-ux --set image.tag=$GIT_COMMIT'
          }
        }
      }
    }

    stage('Cypress') {
      steps {
        container('cypress') {
          dir("$WORKSPACE/client") {
            sshagent (credentials: ['github']) {
              withCredentials([file(credentialsId: 'ssh_key', variable: 'keyfile')]){
                echo 'Replacing localhost:5000 with dev.satyrn.io'
                sh 'cd cypress && find ./ -type f -exec sed -i "s/localhost:5000/dev.satyrn.io/g" {} \\; && cd -'
                echo 'Running cypress tests!'
                sh """
                  mkdir -p ~/.ssh
                  ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts
                  cp ${keyfile} ~/.ssh/id_rsa && chmod 400 ~/.ssh/id_rsa
                  npm -v
                  node -v
                  npm install
                  PORT=5000 npm run start &
                  npm run e2e
                  """
            }
            }
          }
        }
      }
    }
  }
}

