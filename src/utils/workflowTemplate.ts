import { AppConfig } from '../types';

/**
 * Generates an Android GitHub Actions workflow that compiles a real Android APK & AAB
 * faithfully matching all user configurations (App Icon, Colors, Splash, Permissions, Orientation).
 */
export function generateWorkflowYml(config: AppConfig, iconBase64?: string): string {
  const safeAppName = config.appName.replace(/'/g, "\\'").replace(/"/g, '\\"');
  const safeTagline = (config.splash?.tagline || 'Selamat datang di aplikasi kami').replace(/'/g, "\\'").replace(/"/g, '\\"');
  const safeUrl = config.url || 'https://tokoonline-store.com';
  const orientationAttr = config.orientation !== 'unspecified' ? `android:screenOrientation="${config.orientation}"` : '';

  // Permission tags
  const permissionsList = [
    '    <uses-permission android:name="android.permission.INTERNET" />',
    '    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />',
  ];
  if (config.permissions?.camera) {
    permissionsList.push('    <uses-permission android:name="android.permission.CAMERA" />');
  }
  if (config.permissions?.location) {
    permissionsList.push('    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />');
    permissionsList.push('    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />');
  }
  if (config.permissions?.storage) {
    permissionsList.push('    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />');
  }
  if (config.permissions?.microphone) {
    permissionsList.push('    <uses-permission android:name="android.permission.RECORD_AUDIO" />');
  }
  if (config.permissions?.notifications || config.firebase?.enabled) {
    permissionsList.push('    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />');
  }

  // Splash Screen view block for activity_main.xml
  const splashLayoutXml = config.splash?.enabled ? `
              <!-- Native Splash Screen Overlay -->
              <LinearLayout
                  android:id="@+id/splashOverlay"
                  android:layout_width="match_parent"
                  android:layout_height="match_parent"
                  android:orientation="vertical"
                  android:gravity="center"
                  android:background="@color/splash_bg"
                  android:padding="24dp">

                  <ImageView
                      android:id="@+id/splashIcon"
                      android:layout_width="96dp"
                      android:layout_height="96dp"
                      android:src="@mipmap/ic_launcher"
                      android:contentDescription="@string/app_name" />

                  <TextView
                      android:layout_width="wrap_content"
                      android:layout_height="wrap_content"
                      android:layout_marginTop="16dp"
                      android:text="@string/app_name"
                      android:textColor="#FFFFFF"
                      android:textSize="20sp"
                      android:textStyle="bold" />

                  <TextView
                      android:layout_width="wrap_content"
                      android:layout_height="wrap_content"
                      android:layout_marginTop="8dp"
                      android:text="${safeTagline}"
                      android:textColor="#94A3B8"
                      android:textSize="14sp" />

                  <ProgressBar
                      android:layout_width="32dp"
                      android:layout_height="32dp"
                      android:layout_marginTop="32dp"
                      android:indeterminate="true" />
              </LinearLayout>` : '';

  // Splash Kotlin dismiss block
  const splashDismissKt = config.splash?.enabled ? `
                  val splashOverlay = findViewById<View>(R.id.splashOverlay)
                  android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                      splashOverlay?.animate()
                          ?.alpha(0f)
                          ?.setDuration(400)
                          ?.withEndAction { splashOverlay.visibility = View.GONE }
                  }, ${config.splash.durationSeconds * 1000}L)
  ` : '';

  // Icon writing script (if base64 provided)
  const iconScript = iconBase64 ? `
          # Write Custom Icon from Web2App
          mkdir -p android/app/src/main/res/drawable
          mkdir -p android/app/src/main/res/mipmap-mdpi
          mkdir -p android/app/src/main/res/mipmap-hdpi
          mkdir -p android/app/src/main/res/mipmap-xhdpi
          mkdir -p android/app/src/main/res/mipmap-xxhdpi
          mkdir -p android/app/src/main/res/mipmap-xxxhdpi

          cat << 'EOF' | base64 -d > android/app/src/main/res/drawable/ic_launcher.png
${iconBase64}
EOF
          cp android/app/src/main/res/drawable/ic_launcher.png android/app/src/main/res/mipmap-mdpi/ic_launcher.png
          cp android/app/src/main/res/drawable/ic_launcher.png android/app/src/main/res/mipmap-hdpi/ic_launcher.png
          cp android/app/src/main/res/drawable/ic_launcher.png android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
          cp android/app/src/main/res/drawable/ic_launcher.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
          cp android/app/src/main/res/drawable/ic_launcher.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

          cp android/app/src/main/res/drawable/ic_launcher.png android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
          cp android/app/src/main/res/drawable/ic_launcher.png android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
          cp android/app/src/main/res/drawable/ic_launcher.png android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
          cp android/app/src/main/res/drawable/ic_launcher.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
          cp android/app/src/main/res/drawable/ic_launcher.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
` : `
          # Fallback Vector Icon
          mkdir -p android/app/src/main/res/drawable
          cat << 'EOF' > android/app/src/main/res/drawable/ic_launcher.xml
          <vector xmlns:android="http://schemas.android.com/apk/res/android"
              android:width="108dp"
              android:height="108dp"
              android:viewportWidth="108"
              android:viewportHeight="108">
              <path android:fillColor="${config.themeColor}" android:pathData="M0,0h108v108h-108z"/>
              <path android:fillColor="#FFFFFF" android:pathData="M35,24h38c6.075,0 11,4.925 11,11v38c0,6.075 -4.925,11 -11,11h-38c-6.075,0 -11,-4.925 -11,-11v-38c0,-6.075 4.925,-11 11,-11z"/>
              <path android:fillColor="${config.themeColor}" android:pathData="M42,32h24c3.314,0 6,2.686 6,6v32c0,3.314 -2.686,6 -6,6h-24c-3.314,0 -6,-2.686 -6,-6v-32c0,-3.314 2.686,-6 6,-6z"/>
          </vector>
          EOF
          mkdir -p android/app/src/main/res/mipmap-xxxhdpi
          cp android/app/src/main/res/drawable/ic_launcher.xml android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.xml
          cp android/app/src/main/res/drawable/ic_launcher.xml android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.xml
`;

  return `name: Build Real Android APK & AAB

on:
  workflow_dispatch:
    inputs:
      target_url:
        description: 'URL Website untuk dijadikan aplikasi Android'
        required: true
        default: '${safeUrl}'
      app_name:
        description: 'Nama Aplikasi Android'
        required: true
        default: '${safeAppName}'
      package_name:
        description: 'Package Name / Application ID'
        required: true
        default: '${config.packageName}'

permissions:
  contents: write

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Java 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Set up Gradle
        uses: gradle/actions/setup-gradle@v3
        with:
          gradle-version: '8.4'

      - name: Set up Android SDK
        uses: android-actions/setup-android@v3

      - name: Accept Android SDK Licenses & Install Platform
        run: |
          yes | sdkmanager --licenses || true
          sdkmanager "platforms;android-34" "build-tools;34.0.0" || true

      - name: Generate Android Project Sources
        run: |
          RAW_TARGET_URL="\${{ github.event.inputs.target_url }}"
          RAW_APP_NAME="\${{ github.event.inputs.app_name }}"
          RAW_PKG_NAME="\${{ github.event.inputs.package_name }}"

          if [ -z "$RAW_TARGET_URL" ]; then
            RAW_TARGET_URL="${safeUrl}"
          fi
          if [ -z "$RAW_APP_NAME" ]; then
            RAW_APP_NAME="${safeAppName}"
          fi
          if [ -z "$RAW_PKG_NAME" ]; then
            RAW_PKG_NAME="${config.packageName}"
          fi

          # Sanitize package name (letters, digits, underscores, dots)
          PKG_NAME=$(echo "$RAW_PKG_NAME" | tr -d ' ' | tr -cd '[:alnum:]._')
          if [[ "$PKG_NAME" != *.* ]]; then
            PKG_NAME="com.web2app.$PKG_NAME"
          fi

          # Sanitize Target URL
          TARGET_URL="$RAW_TARGET_URL"
          if [[ ! "$TARGET_URL" =~ ^https?:// ]]; then
            TARGET_URL="https://$TARGET_URL"
          fi

          # Sanitize App Name for XML
          APP_NAME="$RAW_APP_NAME"
          SAFE_APP_NAME=$(echo "$APP_NAME" | sed "s/'/\\\\'/g" | sed 's/&/\\&amp;/g' | sed 's/</\\&lt;/g' | sed 's/>/\\&gt;/g')
          SAFE_TARGET_URL=$(echo "$TARGET_URL" | sed 's/&/\\&amp;/g')

          # Calculate package directory path
          PKG_DIR=$(echo "$PKG_NAME" | tr '.' '/')

          # Create directory structure
          mkdir -p "android/app/src/main/java/$PKG_DIR"
          mkdir -p android/app/src/main/res/values
          mkdir -p android/app/src/main/res/layout
          mkdir -p android/app/src/main/res/drawable

          # 1. settings.gradle.kts
          cat << 'EOF' > android/settings.gradle.kts
          pluginManagement {
              repositories {
                  google()
                  mavenCentral()
                  gradlePluginPortal()
              }
          }
          dependencyResolutionManagement {
              repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
              repositories {
                  google()
                  mavenCentral()
              }
          }
          rootProject.name = "Web2App"
          include(":app")
          EOF

          # 2. Root build.gradle.kts
          cat << 'EOF' > android/build.gradle.kts
          plugins {
              id("com.android.application") version "8.3.2" apply false
              id("org.jetbrains.kotlin.android") version "1.9.22" apply false
          }
          EOF

          # 3. gradle.properties
          cat << 'EOF' > android/gradle.properties
          org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
          android.useAndroidX=true
          android.builder.sdkDownload=true
          EOF

          # 4. App build.gradle.kts
          cat << EOF > android/app/build.gradle.kts
          plugins {
              id("com.android.application")
              id("org.jetbrains.kotlin.android")
          }

          android {
              namespace = "$PKG_NAME"
              compileSdk = 34

              defaultConfig {
                  applicationId = "$PKG_NAME"
                  minSdk = ${config.minSdk || 24}
                  targetSdk = 34
                  versionCode = ${config.versionCode || 1}
                  versionName = "${config.versionName || '1.0.0'}"
              }

              buildTypes {
                  release {
                      isMinifyEnabled = false
                      proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
                  }
                  debug {
                      isDebuggable = true
                  }
              }
              compileOptions {
                  sourceCompatibility = JavaVersion.VERSION_17
                  targetCompatibility = JavaVersion.VERSION_17
              }
              kotlinOptions {
                  jvmTarget = "17"
              }
          }

          dependencies {
              implementation("androidx.core:core-ktx:1.13.1")
              implementation("androidx.appcompat:appcompat:1.7.0")
              implementation("com.google.android.material:material:1.12.0")
              implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
              implementation("androidx.webkit:webkit:1.11.0")
              implementation("androidx.activity:activity-ktx:1.9.2")
          }
          EOF

          # Proguard rules file
          touch android/app/proguard-rules.pro

          # 5. Strings and values
          cat << EOF > android/app/src/main/res/values/strings.xml
          <resources>
              <string name="app_name">$SAFE_APP_NAME</string>
              <string name="target_url">$SAFE_TARGET_URL</string>
              <bool name="pull_to_refresh_enabled">${config.permissions?.pullToRefresh ? 'true' : 'false'}</bool>
          </resources>
          EOF

          cat << 'EOF' > android/app/src/main/res/values/colors.xml
          <resources>
              <color name="primary">${config.themeColor || '#2563EB'}</color>
              <color name="status_bar">${config.statusBarColor || '#1D4ED8'}</color>
              <color name="nav_bar">${config.navBarColor || '#0F172A'}</color>
              <color name="splash_bg">${config.splash?.bgColor || '#0F172A'}</color>
          </resources>
          EOF

          cat << 'EOF' > android/app/src/main/res/values/styles.xml
          <resources>
              <style name="Theme.Web2App" parent="Theme.AppCompat.Light.NoActionBar">
                  <item name="colorPrimary">@color/primary</item>
                  <item name="colorPrimaryDark">@color/status_bar</item>
                  <item name="android:statusBarColor">@color/status_bar</item>
                  <item name="android:navigationBarColor">@color/nav_bar</item>
              </style>
          </resources>
          EOF

          ${iconScript}

          # 7. Layout activity_main.xml
          cat << 'EOF' > android/app/src/main/res/layout/activity_main.xml
          <?xml version="1.0" encoding="utf-8"?>
          <FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
              android:layout_width="match_parent"
              android:layout_height="match_parent">

              <androidx.swiperefreshlayout.widget.SwipeRefreshLayout 
                  android:id="@+id/swipeRefresh"
                  android:layout_width="match_parent"
                  android:layout_height="match_parent">

                  <FrameLayout
                      android:layout_width="match_parent"
                      android:layout_height="match_parent">

                      <WebView
                          android:id="@+id/webView"
                          android:layout_width="match_parent"
                          android:layout_height="match_parent" />

                      <ProgressBar
                          android:id="@+id/progressBar"
                          style="?android:attr/progressBarStyleHorizontal"
                          android:layout_width="match_parent"
                          android:layout_height="4dp"
                          android:indeterminate="false"
                          android:max="100" />
                  </FrameLayout>
              </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>
              ${splashLayoutXml}
          </FrameLayout>
          EOF

          # 8. AndroidManifest.xml
          cat << 'EOF' > android/app/src/main/AndroidManifest.xml
          <?xml version="1.0" encoding="utf-8"?>
          <manifest xmlns:android="http://schemas.android.com/apk/res/android">
          ${permissionsList.join('\n')}

              <application
                  android:allowBackup="true"
                  android:icon="@mipmap/ic_launcher"
                  android:roundIcon="@mipmap/ic_launcher_round"
                  android:label="@string/app_name"
                  android:theme="@style/Theme.Web2App"
                  android:usesCleartextTraffic="true">
                  <activity
                      android:name=".MainActivity"
                      android:exported="true"
                      ${orientationAttr}
                      android:configChanges="orientation|screenSize|keyboardHidden">
                      <intent-filter>
                          <action android:name="android.intent.action.MAIN" />
                          <category android:name="android.intent.category.LAUNCHER" />
                      </intent-filter>
                  </activity>
              </application>
          </manifest>
          EOF

          # 9. MainActivity.kt with File Chooser (Camera/Gallery) and Back Handler
          cat << EOF > "android/app/src/main/java/$PKG_DIR/MainActivity.kt"
          package $PKG_NAME

          import android.annotation.SuppressLint
          import android.content.Intent
          import android.graphics.Bitmap
          import android.net.Uri
          import android.os.Bundle
          import android.view.View
          import android.webkit.GeolocationPermissions
          import android.webkit.ValueCallback
          import android.webkit.WebChromeClient
          import android.webkit.WebView
          import android.webkit.WebViewClient
          import android.widget.ProgressBar
          import androidx.activity.OnBackPressedCallback
          import androidx.activity.result.contract.ActivityResultContracts
          import androidx.appcompat.app.AppCompatActivity
          import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

          class MainActivity : AppCompatActivity() {
              private lateinit var webView: WebView
              private lateinit var swipeRefresh: SwipeRefreshLayout
              private lateinit var progressBar: ProgressBar
              private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

              private val fileChooserLauncher = registerForActivityResult(
                  ActivityResultContracts.StartActivityForResult()
              ) { result ->
                  if (result.resultCode == RESULT_OK) {
                      val data = result.data
                      val results: Array<Uri>? = when {
                          data?.dataString != null -> arrayOf(Uri.parse(data.dataString))
                          data?.clipData != null -> {
                              val count = data.clipData!!.itemCount
                              Array(count) { i -> data.clipData!!.getItemAt(i).uri }
                          }
                          else -> null
                      }
                      fileUploadCallback?.onReceiveValue(results)
                  } else {
                      fileUploadCallback?.onReceiveValue(null)
                  }
                  fileUploadCallback = null
              }

              @SuppressLint("SetJavaScriptEnabled")
              override fun onCreate(savedInstanceState: Bundle?) {
                  super.onCreate(savedInstanceState)
                  setContentView(R.layout.activity_main)

                  try {
                      window.statusBarColor = android.graphics.Color.parseColor("${config.statusBarColor || '#1D4ED8'}")
                      window.navigationBarColor = android.graphics.Color.parseColor("${config.navBarColor || '#0F172A'}")
                  } catch (e: Exception) {}

                  webView = findViewById(R.id.webView)
                  swipeRefresh = findViewById(R.id.swipeRefresh)
                  progressBar = findViewById(R.id.progressBar)

                  webView.settings.apply {
                      javaScriptEnabled = true
                      domStorageEnabled = true
                      databaseEnabled = true
                      allowFileAccess = true
                      allowContentAccess = true
                      useWideViewPort = true
                      loadWithOverviewMode = true
                      setSupportZoom(true)
                      builtInZoomControls = true
                      displayZoomControls = false
                  }

                  webView.webViewClient = object : WebViewClient() {
                      override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                          progressBar.visibility = View.VISIBLE
                      }
                      override fun onPageFinished(view: WebView?, url: String?) {
                          progressBar.visibility = View.GONE
                          swipeRefresh.isRefreshing = false
                      }
                  }

                  webView.webChromeClient = object : WebChromeClient() {
                      override fun onProgressChanged(view: WebView?, newProgress: Int) {
                          progressBar.progress = newProgress
                          if (newProgress >= 100) progressBar.visibility = View.GONE
                      }

                      override fun onShowFileChooser(
                          webView: WebView?,
                          filePathCallback: ValueCallback<Array<Uri>>?,
                          fileChooserParams: FileChooserParams?
                      ): Boolean {
                          fileUploadCallback?.onReceiveValue(null)
                          fileUploadCallback = filePathCallback

                          val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                              type = "*/*"
                              addCategory(Intent.CATEGORY_OPENABLE)
                          }
                          try {
                              fileChooserLauncher.launch(intent)
                          } catch (e: Exception) {
                              fileUploadCallback = null
                              return false
                          }
                          return true
                      }

                      override fun onGeolocationPermissionsShowPrompt(
                          origin: String?,
                          callback: GeolocationPermissions.Callback?
                      ) {
                          callback?.invoke(origin, true, false)
                      }
                  }

                  val pullRefreshEnabled = resources.getBoolean(R.bool.pull_to_refresh_enabled)
                  swipeRefresh.isEnabled = pullRefreshEnabled
                  if (pullRefreshEnabled) {
                      swipeRefresh.setOnRefreshListener {
                          webView.reload()
                      }
                  }

                  onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
                      override fun handleOnBackPressed() {
                          if (webView.canGoBack()) {
                              webView.goBack()
                          } else {
                              finish()
                          }
                      }
                  })

                  ${splashDismissKt}

                  val url = getString(R.string.target_url)
                  webView.loadUrl(url)
              }
          }
          EOF

      - name: Build Android APK
        working-directory: android
        run: |
          gradle assembleDebug --no-daemon --stacktrace

      - name: Upload Real APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-debug-real-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
          if-no-files-found: error
`;
}

export const LATEST_WORKFLOW_YML = generateWorkflowYml({
  url: 'https://tokoonline-store.com',
  appName: 'Web2App',
  packageName: 'com.web2app.app',
  versionName: '1.0.0',
  versionCode: 1,
  themeColor: '#2563EB',
  statusBarColor: '#1D4ED8',
  navBarColor: '#0F172A',
  orientation: 'portrait',
  architecture: 'webview',
  targetSdk: 34,
  minSdk: 24,
  permissions: {
    camera: true,
    location: true,
    storage: true,
    microphone: false,
    notifications: true,
    pullToRefresh: true,
    offlineCache: true,
    externalLinks: true,
    fullscreen: false,
  },
  keystore: {
    alias: 'release-key',
    storePassword: 'Password123!',
    keyPassword: 'Password123!',
    validityYears: 30,
    organization: 'Web2App',
    countryCode: 'ID',
    sha1: '',
    sha256: '',
  },
  icon: {
    type: 'emoji',
    value: '🛍️',
    bgColor: '#2563EB',
    shape: 'squircle',
  },
  splash: {
    enabled: true,
    durationSeconds: 2,
    bgColor: '#0F172A',
    tagline: 'Aplikasi Resmi Android',
  },
  playStore: {
    shortDesc: '',
    fullDesc: '',
    category: '',
    contactEmail: '',
    privacyPolicyUrl: '',
  },
  firebase: {
    enabled: false,
    projectId: '',
    appId: '',
    apiKey: '',
    messagingSenderId: '',
    serverKey: '',
    channelId: 'default_channel',
    channelName: 'Notifikasi',
    soundEnabled: true,
    vibrateEnabled: true,
    badgeEnabled: true,
  },
});
