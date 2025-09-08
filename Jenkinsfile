pipeline{
    agent any
    options {
        timeout(time:10, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '5', artifactNumToKeepStr: '5'))
    }
    environment {
        REGISTRY = ''
        USER = 'gitlab-ci-token'
        SERVER_IP = '10.50.230.14'
        SERVER_USER = 'deployer'
        TAG = sh(returnStdout: true, script: "git rev-parse --short=10 HEAD").trim()
    }
    stages{
        stage('Pull changes'){
            steps{
                script{
                    sh 'git pull origin ${BRANCH_NAME}'
                }
            }
        }
        stage('Push Docker image'){
            steps{
                script{
                    if(env.BRANCH_NAME == 'main'){
                        withCredentials([string(credentialsId: '', variable: 'ACCESS_TOKEN')]){
                            sh 'docker build -f prod.Dockerfile -t $REGISTRY:$TAG -t $REGISTRY:latest .'
                            sh 'echo $ACCESS_TOKEN | docker login -u ${USER} --password-stdin $REGISTRY'
                            sh 'docker push $REGISTRY:$TAG'
                            sh 'docker push $REGISTRY:latest'
                            sh 'docker logout $REGISTRY'
                        }
                    }
                }
            }
        }
        stage('Runing Docker image'){
            steps{
                script{
                    if(env.BRANCH_NAME == 'main'){
                        withCredentials([
                            sshUserPrivateKey(credentialsId: 'ssh-key-deployer-gato', keyFileVariable: 'keyfile'),
                            string(credentialsId: '', variable: 'ACCESS_TOKEN')
                        ]){
                            sh 'ssh -i ${keyfile} -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo $ACCESS_TOKEN | docker login -u ${USER} --password-stdin $REGISTRY"'
                            sh 'ssh -i ${keyfile} -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "docker pull $REGISTRY"'
                            sh 'ssh -i ${keyfile} -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "docker rm -f nginx-eventos | true"'
                            sh 'ssh -i ${keyfile} -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "docker run -d -p 9021:80 --restart always --name nginx-eventos $REGISTRY"'
                            sh 'ssh -i ${keyfile} -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "docker logout $REGISTRY"'
                        }
                    }
                }
            }
        }
    }
}
