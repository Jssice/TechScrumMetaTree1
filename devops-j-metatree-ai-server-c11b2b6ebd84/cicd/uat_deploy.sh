aws ecr get-login-password --region REGION | sudo docker login --username AWS --password-stdin ECR_URL
if [ "$(sudo docker ps -q -f name=CntName)" ]; then sudo docker stop CntName && sudo docker rm CntName; fi
sudo docker images -qa |xargs sudo docker rmi
sudo docker run -d -p 5001:5001 --env-file /root/metatree/.server.uat --restart=always --name CntName ECR_URL/ImgName:ImgTag