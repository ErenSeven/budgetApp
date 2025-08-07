# budgetApp
Next.js ve Node.js kullanılarak geliştirilen, kullanıcıların harcamalarını takip edip aylık harcama limiti belirleyebildiği bütçe yönetim uygulaması.

#Yükleme ve kurulum 

### 1. Depoyu klonlayın
git clone https://github.com/ErenSeven/budgetApp.git

### 2. Gereklilikleri yükleme
Önce budgetAppNodeServer dizinine gidin ve npm install komutuyla gerekli paketleri yükleyin.
Ardından budgetAppNodeServer içerisinde .env dosyası oluşturup aşağıdaki gibi doldurun:
----------------------------------------------------------------------------------------------------------------------------------------------------------------------
MongoDB bağlantı URI'si
MONGODB_URI=mongodb+srv://<kullanici_adi>:<sifre>@<cluster_adı>.mongodb.net/<veritabani_adi>?retryWrites=true&w=majority&appName=<uygulama_adi>

JWT için erişim token gizli anahtarı (Access Token Secret)
JWT_ACCESS_SECRET='gizli_anahtarin'

JWT için yenileme token gizli anahtarı (Refresh Token Secret)
JWT_REFRESH_SECRET='refresh_gizli_anahtarin'

Uygulama çalışma ortamı (development, production, vb.)
NODE_ENV=development

----------------------------------------------------------------------------------------------------------------------------------------------------------------------
Daha sonra budgetAppUi dizininde terminali açarak şu adımları uygulayın:
npm install
npm run build
npm run dev

### 3. Sunucuyu ve Arayüzü Başlatma
Server dizininde terminali açıp:
node app.js 
ui dizinini terminalde açıp:
npm run dev 
komutlarını çalıştırarak sırasıyla önce sunucuyu, ardından arayüzü başlatabilir ve uygulamayı test edebilirsiniz.




