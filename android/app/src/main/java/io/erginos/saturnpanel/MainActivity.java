package io.erginos.saturnpanel;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.text.InputType;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.view.inputmethod.EditorInfo;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * Full-screen WebView for the panel. The URL is asked for on first start and kept in preferences.
 * Change it from a computer with: adb shell am start -n io.erginos.saturnpanel/.MainActivity --es url URL
 * The activity is exported, so any app can send that intent: a URL from an intent only prefills the
 * setup screen, and someone at the phone has to confirm it.
 */
public class MainActivity extends Activity {
    private static final String PREFS = "panel";
    private static final String KEY_URL = "url";
    private static final String EXAMPLE_URL = "http://homeassistant.local:8123/local/panel/index.html";

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        String fromIntent = urlFrom(getIntent());
        String saved = savedUrl();
        if (fromIntent != null) showSetup(fromIntent);
        else if (saved == null) showSetup(EXAMPLE_URL);
        else showPanel(saved);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        String url = urlFrom(intent);
        if (url != null) showSetup(url);
    }

    @Override
    protected void onResume() {
        super.onResume();
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    private SharedPreferences prefs() {
        return getSharedPreferences(PREFS, MODE_PRIVATE);
    }

    private String savedUrl() {
        return prefs().getString(KEY_URL, null);
    }

    private void saveUrl(String url) {
        prefs().edit().putString(KEY_URL, url).apply();
    }

    private static boolean isWebUrl(String url) {
        String scheme = Uri.parse(url).getScheme();
        return "http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme);
    }

    private static String urlFrom(Intent intent) {
        String url = intent == null ? null : intent.getStringExtra(KEY_URL);
        return url == null || url.trim().isEmpty() ? null : url.trim();
    }

    private void showPanel(String url) {
        if (webView == null) {
            webView = new WebView(this);
            webView.setBackgroundColor(Color.BLACK);
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setAllowFileAccess(false);
            settings.setAllowContentAccess(false);
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
            settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
            webView.setWebViewClient(new WebViewClient());
            webView.addJavascriptInterface(new Haptics(getSystemService(Vibrator.class)), "Haptics");
        }
        setContentView(webView);
        webView.loadUrl(url);
    }

    private void showSetup(String prefill) {
        int pad = Math.round(32 * getResources().getDisplayMetrics().density);
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER);
        box.setPadding(pad, pad, pad, pad);
        box.setBackgroundColor(Color.BLACK);

        TextView title = new TextView(this);
        title.setText(R.string.setup_title);
        title.setTextColor(Color.WHITE);
        title.setTextSize(TypedValue.COMPLEX_UNIT_SP, 22);
        box.addView(title);

        EditText input = new EditText(this);
        input.setText(prefill);
        input.setTextColor(Color.WHITE);
        input.setSingleLine(true);
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        input.setImeOptions(EditorInfo.IME_ACTION_GO | EditorInfo.IME_FLAG_NO_EXTRACT_UI | EditorInfo.IME_FLAG_NO_FULLSCREEN);
        box.addView(input, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        Button start = new Button(this);
        start.setText(R.string.setup_start);
        box.addView(start);

        String saved = savedUrl();
        if (saved != null) {
            Button cancel = new Button(this);
            cancel.setText(R.string.setup_cancel);
            cancel.setOnClickListener(v -> showPanel(saved));
            box.addView(cancel);
        }

        Runnable save = () -> {
            String url = input.getText().toString().trim();
            if (!isWebUrl(url)) {
                input.setError(getString(R.string.setup_invalid));
                return;
            }
            saveUrl(url);
            showPanel(url);
        };
        start.setOnClickListener(v -> save.run());
        input.setOnEditorActionListener((v, actionId, event) -> {
            save.run();
            return true;
        });
        setContentView(box);
    }

    static final class Haptics {
        private final Vibrator vibrator;

        Haptics(Vibrator vibrator) {
            this.vibrator = vibrator;
        }

        @JavascriptInterface
        public void play(String kind) {
            if (vibrator == null || !vibrator.hasVibrator()) return;
            // Spinning motor: a short click dies before it gets up to speed,
            // so it is only felt on the frame. A long full-power pulse reaches the glass.
            VibrationEffect effect;
            switch (String.valueOf(kind)) {
                case "tick":
                    effect = VibrationEffect.createOneShot(80, 255);
                    break;
                case "heavy":
                    effect = VibrationEffect.createOneShot(220, 255);
                    break;
                default:
                    effect = VibrationEffect.createOneShot(160, 255);
            }
            vibrator.vibrate(effect);
        }
    }

    @SuppressWarnings("deprecation")
    private void hideSystemBars() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().getInsetsController().hide(
                    android.view.WindowInsets.Type.statusBars()
                            | android.view.WindowInsets.Type.navigationBars());
            getWindow().getInsetsController().setSystemBarsBehavior(
                    android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
    }
}
