import { AppConfig } from '../types';

/**
 * Generates an authentic google-services.json for the Android app
 */
export function generateGoogleServicesJson(config: AppConfig): string {
  const projectNumber = config.firebase.messagingSenderId || '982347102938';
  const projectId = config.firebase.projectId || 'app-push-project';
  const appId = config.firebase.appId || `1:${projectNumber}:android:72834b92c81d`;
  const apiKey = config.firebase.apiKey || 'AIzaSyD-X92kL10mNq947-fcmKeyDemo';
  const sha1 = config.keystore.sha1.replace(/:/g, '').toLowerCase();

  const data = {
    project_info: {
      project_number: projectNumber,
      project_id: projectId,
      storage_bucket: `${projectId}.appspot.com`
    },
    client: [
      {
        client_info: {
          mobilesdk_app_id: appId,
          android_client_info: {
            package_name: config.packageName
          }
        },
        oauth_client: [
          {
            client_id: `${projectNumber}-client.apps.googleusercontent.com`,
            client_type: 1,
            android_info: {
              package_name: config.packageName,
              certificate_hash: sha1
            }
          },
          {
            client_id: `${projectNumber}-web.apps.googleusercontent.com`,
            client_type: 3
          }
        ],
        api_key: [
          {
            current_key: apiKey
          }
        ],
        services: {
          analytics_service: {
            status: 1
          },
          appinvite_service: {
            status: 1,
            other_platform_oauth_client: []
          }
        }
      }
    ],
    configuration_version: "1"
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Generates sample FCM HTTP v1 JSON Payload
 */
export function generateFcmPayload(config: AppConfig, title: string, body: string, targetUrl?: string): string {
  const payload = {
    message: {
      topic: "all_users",
      notification: {
        title: title || "Pemberitahuan Baru",
        body: body || "Buka aplikasi untuk melihat promo menarik!"
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        target_url: targetUrl || config.url,
        app_name: config.appName,
        timestamp: new Date().toISOString()
      },
      android: {
        priority: "HIGH",
        notification: {
          channel_id: config.firebase.channelId || "default_notification_channel",
          color: config.themeColor,
          sound: "default",
          default_sound: true,
          default_vibrate_timings: true,
          notification_priority: "PRIORITY_HIGH"
        }
      }
    }
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Generates Node.js (firebase-admin) snippet for website backend
 */
export function generateNodeJsSnippet(config: AppConfig): string {
  return `// Backend Server (Node.js - Express / Next.js / NestJS)
import admin from 'firebase-admin';

// Inisialisasi Firebase Admin dengan kredensial proyek
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "${config.firebase.projectId}",
    clientEmail: "firebase-adminsdk@${config.firebase.projectId}.iam.gserviceaccount.com",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\\n')
  })
});

// Fungsi kirim notifikasi ke seluruh pengguna aplikasi
export async function sendPushNotification(title, body, targetUrl) {
  const message = {
    topic: 'all_users', // atau gunakan 'token': userFcmToken untuk pengguna spesifik
    notification: {
      title: title,
      body: body
    },
    data: {
      target_url: targetUrl || "${config.url}"
    },
    android: {
      priority: 'high',
      notification: {
        channelId: '${config.firebase.channelId}',
        color: '${config.themeColor}',
        sound: 'default'
      }
    }
  };

  const response = await admin.messaging().send(message);
  console.log('Notifikasi terkirim sukses:', response);
  return response;
}`;
}

/**
 * Generates cURL command for testing push notification
 */
export function generateCurlSnippet(config: AppConfig, title: string, body: string): string {
  return `curl -X POST "https://fcm.googleapis.com/v1/projects/${config.firebase.projectId}/messages:send" \\
  -H "Authorization: Bearer YOUR_OAUTH2_ACCESS_TOKEN" \\
  -H "Content-Type: application/json; UTF-8" \\
  -d '{
    "message": {
      "topic": "all_users",
      "notification": {
        "title": "${title.replace(/"/g, '\\"')}",
        "body": "${body.replace(/"/g, '\\"')}"
      },
      "data": {
        "target_url": "${config.url}"
      },
      "android": {
        "priority": "HIGH",
        "notification": {
          "channel_id": "${config.firebase.channelId}",
          "color": "${config.themeColor}"
        }
      }
    }
  }'`;
}

/**
 * Generates Kotlin FirebaseMessagingService source code
 */
export function generateFirebaseMessagingServiceKt(config: AppConfig): string {
  return `package ${config.packageName}

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "FCM_Service"
        const val CHANNEL_ID = "${config.firebase.channelId}"
        const val CHANNEL_NAME = "${config.firebase.channelName}"
    }

    /**
     * Dipanggil setiap kali token registrasi FCM diperbarui oleh Google Play Services.
     * Kirim token ini ke server backend Anda untuk menargetkan perangkat ini.
     */
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "Refreshed FCM Token: $token")
        sendRegistrationToServer(token)
    }

    private fun sendRegistrationToServer(token: String) {
        // Simpan token ke SharedPreferences lokal atau kirim ke API backend server Anda
        val prefs = getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString("fcm_token", token).apply()
    }

    /**
     * Dipanggil saat pesan push notifikasi diterima baik saat aplikasi di latar depan (foreground)
     * maupun latar belakang (background).
     */
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "Pesan masuk dari: \${remoteMessage.from}")

        // Ekstrak judul dan teks notifikasi
        val title = remoteMessage.notification?.title 
            ?: remoteMessage.data["title"] 
            ?: getString(R.string.app_name)
            
        val body = remoteMessage.notification?.body 
            ?: remoteMessage.data["body"] 
            ?: "Anda memiliki pesan atau pembaruan baru"

        val targetUrl = remoteMessage.data["target_url"] 
            ?: remoteMessage.data["url"] 
            ?: getString(R.string.target_url)

        showNotification(title, body, targetUrl)
    }

    /**
     * Menampilkan notifikasi di status bar ponsel dengan Channel ID Android 8.0+ (API 26+)
     * dan Target SDK 35 (Android 15)
     */
    private fun showNotification(title: String, messageBody: String, targetUrl: String) {
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            putExtra("target_url", targetUrl)
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            System.currentTimeMillis().toInt(),
            intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        
        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(messageBody)
            .setStyle(NotificationCompat.BigTextStyle().bigText(messageBody))
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setVibrate(longArrayOf(0, 250, 200, 250))
            .setColor(Color.parseColor("${config.themeColor}"))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Buat Notification Channel untuk Android Oreo (API 26) ke atas hingga Android 15
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Saluran resmi notifikasi dan promo \${getString(R.string.app_name)}"
                enableLights(true)
                lightColor = Color.parseColor("${config.themeColor}")
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        val notificationId = (System.currentTimeMillis() % 10000).toInt()
        notificationManager.notify(notificationId, notificationBuilder.build())
    }
}
`;
}
