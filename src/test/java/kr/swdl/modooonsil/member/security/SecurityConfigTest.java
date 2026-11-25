package kr.swdl.modooonsil.member.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SecurityConfigTest {

    @LocalServerPort
    int port;

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
