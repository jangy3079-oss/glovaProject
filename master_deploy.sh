#!/bin/bash
set -e # 에러 발생 시 즉시 중단

# 설정 변수
PEM_PATH="./glova-seoul.pem"
SERVER_IP="43.200.178.153"
PROJECT_PATH="/home/ubuntu/GlobarProject"
JAR_NAME="GlobarProject-0.0.1-SNAPSHOT.jar"

echo "🚀 Globar 프로젝트 최종 로컬 빌드 및 배포를 시작합니다..."

# 2. 서버 준비 (구버전 JAR 삭제 및 디렉토리 생성)
echo "🧹 서버 환경 정리 중..."
ssh -i "$PEM_PATH" ubuntu@$SERVER_IP << EOF
    # 기존 프로세스 종료
    TARGET_PID=\$(lsof -t -i:8080)
    if [ -n "\$TARGET_PID" ]; then
        kill -9 \$TARGET_PID
        sleep 2
    fi
    mkdir -p $PROJECT_PATH/build/libs
    rm -f $PROJECT_PATH/build/libs/$JAR_NAME
EOF

# 3. 빌드된 JAR 파일 및 소스 코드를 서버로 전송
echo "📦 최신 파일 전송 중..."
rsync -avz -e "ssh -i $PEM_PATH" --exclude '.DS_Store' src/ ubuntu@$SERVER_IP:$PROJECT_PATH/src/
rsync -avz -e "ssh -i $PEM_PATH" build.gradle ubuntu@$SERVER_IP:$PROJECT_PATH/build.gradle
rsync -avz -e "ssh -i $PEM_PATH" build/libs/$JAR_NAME ubuntu@$SERVER_IP:$PROJECT_PATH/build/libs/$JAR_NAME

# 4. 서버 실행
echo "📋 서버에서 애플리케이션을 실행합니다..."
ssh -i "$PEM_PATH" ubuntu@$SERVER_IP << EOF
    cd $PROJECT_PATH
    echo "▶️ 새 버전을 실행합니다: $JAR_NAME"
    chmod +x build/libs/$JAR_NAME
    # 본인의 진짜 시크릿코드(32자 이상)와 실제 AWS DB 비밀번호를 적어주세요.
    nohup env JWT_SECRET=my_super_secret_key_for_globar_project_2026 DB_PASSWORD=sky_by114 java -jar build/libs/$JAR_NAME > spring.log 2>&1 &

    sleep 3
    echo "✨ 서버 재시작 완료!"
EOF

echo "✅ 모든 배포 작업이 끝났습니다!"
echo "서버 로그 확인: ssh -i $PEM_PATH ubuntu@$SERVER_IP 'tail -f $PROJECT_PATH/spring.log'"
