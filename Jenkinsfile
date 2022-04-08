pipeline {
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
                  sh "docker build --no-cache --build-arg SSH_PRIVATE_KEY=\"\$(cat ${keyfile})\" -t satyrn-ux . --network=host"
                }
            }
          }
        }
        stage('Push') {
            steps {
                echo  'Logging in!'
                sh 'aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 304793330600.dkr.ecr.us-east-1.amazonaws.com'
                sh 'docker tag satyrn-ux:latest 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:latest'
                sh 'docker push 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:latest'
                sh 'docker tag satyrn-ux:latest 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:$GIT_COMMIT'
                sh 'docker push 304793330600.dkr.ecr.us-east-1.amazonaws.com/satyrn-ux:$GIT_COMMIT'
            }
        }

        stage('Deploy') {
            steps {
                dir("$WORKSPACE/satyrn-deployment") {
                    sh 'helm upgrade --install satyrn-ux charts/common --values charts/satyrn-ux/values-override-dev.yaml --create-namespace --namespace dev-satyrn-ux --set image.tag=$GIT_COMMIT'
                }
            }
        }
    }
}

