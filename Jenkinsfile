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
          - name: unittest
            image: 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:latest
            imagePullPolicy: Always
            command:
            - cat
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
    // GENERAL
    CI_BRANCH = "${env.BRANCH_NAME}"
    DB_PASSWORD = credentials('DB_PASSWORD')

    // DEV  
    DEV_BRANCH_REGEX = /cicd\/dev/
    DEV_PROXY_API_KEY = credentials('DEV_API_KEY')
    DEV_PROXY_API_AUTH_BEARER_TOKEN = credentials('DEV_PROXY_API_AUTH_BEARER_TOKEN')
    DEV_JWT_SECRET = credentials('DEV_JWT_SECRET')
    DEV_SENDGRID_API_KEY = credentials('DEV_SENDGRID_API_KEY')

    // PP
    PP_BRANCH_REGEX = /cicd\/pp/

    // PROD
    PROD_BRANCH_REGEX = /cicd\/prod/
          
  }
    stages { 
        stage('Determine environment DEV') {
            when {
                expression { BRANCH_NAME ==~ DEV_BRANCH_REGEX }
            }
          steps {
            script {
              env.ENVIRONMENT = sh(
                  script: "printf \$(echo dev)",
                  returnStdout: true
                ).trim()
              }
          }
        }
        stage('Determine environment PP') {
            when {
                expression { BRANCH_NAME ==~ /cicd\/pp/ }
            }
          steps {
            script {
              env.ENVIRONMENT = sh(
                  script: "printf \$(echo pp)",
                  returnStdout: true
                ).trim()
              }
          }
        }
        stage('Determine environment PROD') {
            when {
                expression { BRANCH_NAME ==~ /cicd\/prod/ }
            }
          steps {
            script {
              env.ENVIRONMENT = sh(
                  script: "printf \$(echo prod)",
                  returnStdout: true
                ).trim()
              }
          }
        }
        stage('Exit if environment cannot be determined') {
            when {
               anyOf{ 
                 expression { "$ENVIRONMENT" == null }
                 expression { "$ENVIRONMENT" == "null" }
               }
            }
          steps {
            script {
              echo "Environment could not be determined using branch regexes /cicd/prod/, /cicd/dev/, /cicd/pp/ . Exiting pipeline. Environment=${ENVIRONMENT}"
              currentBuild.result = 'SUCCESS'
              return
            }
          }
        }
        stage('Echoing environment') {
          steps {
            script {
              echo "Environment=${ENVIRONMENT}"
            }
          }
        }
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
        stage('Checkout Templates') {
            steps {
                dir("$WORKSPACE/satyrn-templates") {
                    git(
                       branch: 'cicd/fix-path',
                        credentialsId: 'github',
                        url: 'git@github.com:nu-c3lab/satyrn-templates.git'
                    )
                }
            }
        }

        stage('Build docker image') {
            when {
               expression { BRANCH_NAME ==~ DEV_BRANCH_REGEX }
            }
            steps {
            container('build') {
                withCredentials([file(credentialsId: 'ssh_key', variable: 'keyfile')]){
                  echo 'Starting docker build!'
                  sh "set +x ; docker build --build-arg SSH_PRIVATE_KEY=\"\$(cat ${keyfile})\" -t satyrn-ux . --network=host ; set -x"
                }
            }
            }
        }

        stage('Push docker image') {
          when {
              expression { BRANCH_NAME ==~ DEV_BRANCH_REGEX }
          }
          steps{
            container('build') {
                echo  'Logging in!'
                sh 'aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 304793330600.dkr.ecr.us-east-1.amazonaws.com'
                sh 'docker tag satyrn-ux:latest 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:latest'
                sh 'docker push 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:latest'
                sh "docker tag satyrn-ux:latest 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:${ENVIRONMENT}"
                sh "docker push 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:${ENVIRONMENT}"
                sh 'docker tag satyrn-ux:latest 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:$GIT_COMMIT'
                sh 'docker push 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:$GIT_COMMIT'
            }
          }
        }

        stage('Deploy') {
          steps {
            container('build') {
                dir("$WORKSPACE/satyrn-deployment") {
                  sh """
                  timestamp="\$(date +%d-%m-%Y-%H:%M:%s)"
                  if [[ ${ENVIRONMENT} == "dev" ]]; then
                    helm upgrade --install satyrn-ux charts/common --values ../.helm/values-dev.yaml --set env.SENDGRID_API_KEY=$DEV_SENDGRID_API_KEY --set env.PROXY_API_KEY=$DEV_PROXY_API_KEY --set env.DB_PASSWORD=$DB_PASSWORD --set env.JWT_SECRET=$DEV_JWT_SECRET --create-namespace --namespace ${ENVIRONMENT}-satyrn-ux --set image.tag=dev --set-string timestamp="\$timestamp"
                  fi
                  if [[ ${ENVIRONMENT} == "pp" ]]; then
                    helm upgrade --install satyrn-ux charts/common --values ../.helm/values-dev.yaml --set env.SENDGRID_API_KEY=$DEV_SENDGRID_API_KEY --set env.PROXY_API_KEY=$DEV_SENDGRID_API_KEY --set env.DB_PASSWORD=$DB_PASSWORD --set env.JWT_SECRET=$DEV_JWT_SECRET --create-namespace --namespace ${ENVIRONMENT}-satyrn-ux --set image.tag=dev --set-string timestamp="\$timestamp"
                  fi
                  if [[ ${ENVIRONMENT} == "prod" ]]; then
                    helm upgrade --install satyrn-ux charts/common --values ../.helm/values-dev.yaml --set env.SENDGRID_API_KEY=$DEV_SENDGRID_API_KEY --set env.PROXY_API_KEY=$DEV_SENDGRID_API_KEY --set env.DB_PASSWORD=$DB_PASSWORD --set env.JWT_SECRET=$DEV_JWT_SECRET --create-namespace --namespace ${ENVIRONMENT}-satyrn-ux --set image.tag=dev --set-string timestamp="\$timestamp"
                  fi

                  """
              }
            }
          }
        }
        stage('Cypress') {
          when {
              expression { BRANCH_NAME ==~ DEV_BRANCH_REGEX }
          }
          steps {
            container('cypress') {
              dir("$WORKSPACE/client") {
                  withCredentials([file(credentialsId: 'ssh_key', variable: 'keyfile')]){
                    echo 'Replacing localhost:5000 with ${ENVIRONMENT}.satyrn.io'
                    sh 'cd cypress && find ./ -type f | egrep -v "^(.//venv/|.//.git/)" | xargs -I {} sed -i "s/localhost:5000/${ENVIRONMENT}.satyrn.io/g" {} && cd -'
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

