@echo off
chcp 65001 >nul
echo ========================================
echo   KHỞI ĐỘNG BACKEND API
echo ========================================
echo.
echo Đang khởi động server...
echo Backend sẽ chạy tại: http://0.0.0.0:3000
echo.

npm run dev
