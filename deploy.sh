#!/bin/bash

# ==========================================
# AAIC 자동 배포 스크립트 (deploy.sh)
# ==========================================

# 에러 발생 시 스크립트 중단
set -e

# 배포 설정 변수
INSTANCE_IP="168.110.112.103"
SSH_USER="ubuntu"
SSH_KEY="./ssh-key-2026-06-04.key"
REMOTE_WEB_DIR="/var/www/html"
LOCAL_DIST_DIR="dist"
TAR_FILE="dist.tar.gz"

echo "=========================================="
echo "🚀 배포 프로세스를 시작합니다."
echo "=========================================="

# 1. SSH 키 권한 설정 (600 권한 필수)
if [ -f "$SSH_KEY" ]; then
    echo "🔑 SSH 키 파일 권한을 설정하는 중... (chmod 600)"
    chmod 600 "$SSH_KEY"
else
    echo "❌ 에러: SSH 키 파일 ($SSH_KEY)을 찾을 수 없습니다."
    exit 1
fi

# 2. 로컬 프로젝트 빌드
echo "📦 로컬 빌드 중... (npm run build)"
if [ -d "node_modules" ]; then
    npm run build
else
    echo "⚠️ node_modules 폴더가 없습니다. 의존성을 먼저 설치합니다..."
    npm install
    npm run build
fi

# 3. 빌드 결과물 압축
echo "🗜️ 빌드 결과물($LOCAL_DIST_DIR) 압축 중..."
if [ -d "$LOCAL_DIST_DIR" ]; then
    tar -czf "$TAR_FILE" -C "$LOCAL_DIST_DIR" .
    echo "✅ 압축 완료: $TAR_FILE"
else
    echo "❌ 에러: 빌드 결과물 폴더 ($LOCAL_DIST_DIR)가 존재하지 않습니다."
    exit 1
fi

# 4. 원격 서버로 압축 파일 업로드
echo "📤 원격 서버($INSTANCE_IP)로 업로드 중..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no "$TAR_FILE" "$SSH_USER@$INSTANCE_IP:/home/$SSH_USER/"

# 5. 원격 서버에서 압축 해제 및 파일 적용
echo "🔧 원격 서버에서 배포 적용 중..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$INSTANCE_IP" << EOF
    # 기존 웹 디렉토리 백업 또는 비우기 (필요시 백업을 활성화할 수 있습니다)
    echo "🧹 기존 웹 경로 파일 정리 중..."
    sudo rm -rf $REMOTE_WEB_DIR/*

    # 압축 해제
    echo "🔓 압축 해제 및 복사 중..."
    sudo tar -xzf /home/$SSH_USER/$TAR_FILE -C $REMOTE_WEB_DIR

    # 권한 설정 (Nginx가 읽을 수 있도록)
    echo "🔒 권한 설정 중..."
    sudo chown -R www-data:www-data $REMOTE_WEB_DIR
    sudo chmod -R 755 $REMOTE_WEB_DIR

    # 원격 임시 파일 삭제
    echo "🗑️ 원격 임시 파일 삭제 중..."
    rm -f /home/$SSH_USER/$TAR_FILE
EOF

# 6. 로컬 임시 파일 삭제
echo "🧹 로컬 임시 파일 삭제 중..."
rm -f "$TAR_FILE"

echo "=========================================="
echo "🎉 배포가 성공적으로 완료되었습니다!"
echo "👉 브라우저에서 http://$INSTANCE_IP 주소로 접속해 확인해 보세요."
echo "=========================================="
