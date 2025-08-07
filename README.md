# budgetApp
Next.js ve Node.js kullanılarak geliştirilen, kullanıcıların harcamalarını takip edip aylık harcama limiti belirleyebildiği bütçe yönetim uygulaması.

#Yükleme ve kurulum 

### 1. Depoyu klonlayın
git clone https://github.com/ErenSeven/budgetApp.git

### 2. Gereklilikleri yükleme
Önce budgetAppNodeServer dizinine gidin ve npm install komutuyla gerekli paketleri yükleyin.\n
Ardından budgetAppNodeServer içerisinde .env dosyası oluşturup aşağıdaki gibi doldurun:\n
----------------------------------------------------------------------------------------------------------------------------------------------------------------------
MongoDB bağlantı URI'si\n
MONGODB_URI=mongodb+srv://<kullanici_adi>:<sifre>@<cluster_adı>.mongodb.net/<veritabani_adi>?retryWrites=true&w=majority&appName=<uygulama_adi>\n

JWT için erişim token gizli anahtarı (Access Token Secret)\n
JWT_ACCESS_SECRET='gizli_anahtarin'\n

JWT için yenileme token gizli anahtarı (Refresh Token Secret)\n
JWT_REFRESH_SECRET='refresh_gizli_anahtarin'\n

Uygulama çalışma ortamı (development, production, vb.)\n
NODE_ENV=development\n

----------------------------------------------------------------------------------------------------------------------------------------------------------------------
Daha sonra budgetAppUi dizininde terminali açarak şu adımları uygulayın:\n
npm install\n
npm run build\n
npm run dev\n

### 3. Sunucuyu ve Arayüzü Başlatma\n
Server dizininde terminali açıp:\n
node app.js \n
ui dizinini terminalde açıp:\n
npm run dev \n
komutlarını çalıştırarak sırasıyla önce sunucuyu, ardından arayüzü başlatabilir ve uygulamayı test edebilirsiniz.\n




