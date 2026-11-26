package kr.swdl.modooonsil.member.security;

import kr.swdl.modooonsil.member.domain.Member;
import kr.swdl.modooonsil.security.CustomUserDetails;
import kr.swdl.modooonsil.security.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.net.CookieManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SecurityConfigTest {

    @LocalServerPort
    int port;

    @MockitoBean
    CustomUserDetailsService userDetailsService;

    @Autowired
    PasswordEncoder passwordEncoder;

    private final HttpClient client = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    private HttpResponse<String> get(String path, String accept) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Accept", accept)
                .GET()
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void 비로그인_공개_페이지는_200을_반환한다() throws Exception {
        for (String path : new String[]{"/", "/index.html"}) {
            HttpResponse<String> response = get(path, "text/html");
            assertThat(response.statusCode()).isEqualTo(200);
            assertThat(response.body()).contains("class=\"topbar\"", "class=\"sidebar\"", "class=\"site-footer\"");
        }
        for (String path : new String[]{"/login", "/signup"}) {
            HttpResponse<String> response = get(path, "text/html");
            assertThat(response.statusCode()).isEqualTo(200);
        }
    }

    @Test
    void 비로그인_보호_뷰는_로그인으로_리다이렉트한다() throws Exception {
        for (String path : new String[]{
                "/mypage",
                "/cultivation-diaries",
                "/cultivationPlanList.html",
                "/cultivation-plans",
                "/cultivation-plans/new",
                "/cultivation-plans/1",
                "/cultivation-plans/1/edit",
                "/greenhouseList.html",
                "/environmentChangeList.html",
                "/environmentIssueList.html"
        }) {
            HttpResponse<String> response = get(path, "text/html");
            assertThat(response.statusCode()).isEqualTo(302);
            assertThat(response.headers().firstValue("Location")).hasValueSatisfying(
                    location -> assertThat(location).endsWith("/login"));
        }
    }

    @Test
    void 로그인_회원은_작기계획_화면을_열_수_있다() throws Exception {
        when(userDetailsService.loadUserByUsername("plan-test")).thenReturn(new CustomUserDetails(
                Member.builder().memberId(1L).username("plan-test").password(passwordEncoder.encode("password")).build()));
        HttpClient signedIn = HttpClient.newBuilder().cookieHandler(new CookieManager()).build();
        String baseUrl = "http://localhost:" + port;
        HttpRequest login = HttpRequest.newBuilder(URI.create(baseUrl + "/login"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString("username=plan-test&password=password"))
                .build();
        assertThat(signedIn.send(login, HttpResponse.BodyHandlers.discarding()).statusCode()).isEqualTo(302);

        String[][] views = {
                {"/cultivation-plans", "list", "planRows"},
                {"/cultivation-plans/new", "create", "planForm"},
                {"/cultivation-plans/1", "detail", "planDetail"},
                {"/cultivation-plans/1/edit", "edit", "planForm"}
        };
        for (String[] view : views) {
            HttpRequest page = HttpRequest.newBuilder(URI.create(baseUrl + view[0])).build();
            HttpResponse<String> response = signedIn.send(page, HttpResponse.BodyHandlers.ofString());
            assertThat(response.statusCode()).as(view[0]).isEqualTo(200);
            assertThat(response.body()).contains("data-plan-view=\"" + view[1] + "\"", "id=\"" + view[2] + "\"");
        }
    }

    @Test
    void 비로그인_API는_401을_반환한다() throws Exception {
        HttpResponse<String> response = get("/api/auth/me", "application/json");
        assertThat(response.statusCode()).isEqualTo(401);
    }

    @Test
    void 존재하지_않는_HTML_경로는_404_페이지를_렌더링한다() throws Exception {
        HttpResponse<String> response = get("/not-found-page-xyz", "text/html");
        assertThat(response.statusCode()).isEqualTo(404);
        assertThat(response.body()).contains("페이지를 찾을 수 없습니다");
    }
}
