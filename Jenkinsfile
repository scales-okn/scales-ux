pipeline {
  agent {
    kubernetes {
      yaml '''
        apiVersion: v1
        kind: Pod
        metadata:
          labels:
            some-label: ux-build
        spec:
          containers:
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
      GIT_BRANCH_NAME = sh(script: "printf \$(a=`git rev-parse --abbrev-ref HEAD`; if echo \$a | grep -iq HEAD ; then a=dev; echo \$a; else echo \$a ; fi; )",returnStdout: true).trim()
      DEV_PROXY_API_KEY = credentials('API_KEY')
      DB_PASSWORD = credentials('DB_PASSWORD')
      DEV_JWT_SECRET = credentials('DEV_JWT_SECRET')
      DEV_SENDGRID_API_KEY = credentials('DEV_SENDGRID_API_KEY')
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
                sh 'docker tag satyrn-ux:latest 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:$GIT_COMMIT'
                sh 'docker push 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:$GIT_COMMIT'
            }
          }
        }

        stage('Deploy') {
          steps {
            container('build') {
                dir("$WORKSPACE/satyrn-deployment") {
                    sh 'helm upgrade --install satyrn-ux charts/common --values ../.helm/values-dev.yaml --set env.SENDGRID_API_KEY=$DEV_SENDGRID_API_KEY --set env.PROXY_API_KEY=$DEV_PROXY_API_KEY --set env.DB_PASSWORD=$DB_PASSWORD --set env.JWT_SECRET=$DEV_JWT_SECRET --create-namespace --namespace dev-satyrn-ux --set image.tag=$GIT_COMMIT'
                }
            }
          }
        }
    }
}

