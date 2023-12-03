package cs2.dma.main;

import com.alibaba.fastjson.JSONObject;
import cs2.dma.tuil.GameDataManager;
import cs2.dma.tuil.PCUUID;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import javax.swing.*;
import java.awt.*;
import java.io.IOException;
import java.net.URI;
import java.util.Scanner;

@SpringBootApplication
public class Application {

    public static void main(String[] args) throws Exception {
        System.out.println("请先启动游戏");
        SpringApplication.run(Application.class,args);
        runCheat();
    }

    public static void runCheat() throws IOException {
        GameDataManager manager=new GameDataManager();
        manager.setDwEntityList(Long.valueOf(ConfigFileTool.getKey("EntityList")));
        manager.setDwLocalPlayerPawn(Long.valueOf(ConfigFileTool.getKey("LocalPlayerPawn")));
        manager.setMapNameVal(Long.valueOf(ConfigFileTool.getKey("MapName")));
        try {
            if(manager.initializeVmm()){
                //初始化完成
                System.out.println("启动成功");
                if(manager.initializeGameData()){
                    System.out.println("请访问 http://localhost:8080/ 查看雷达");
                    int port = 8899;
                    SocketServer s = new SocketServer(port,manager);
                    s.start();
                    s.sendMsg();
                }
            }
        }catch (Exception e){
            e.printStackTrace();
            System.out.println("与DMA设备连接失败，请检查线路");
            Scanner scanner=new Scanner(System.in);
            System.out.println("输入任意内容后退出");
            scanner.next();
        }
    }
    @Bean
    public RestTemplate restTemplate(ClientHttpRequestFactory factory) {
        return new RestTemplate(factory);
    }

    @Bean
    public ClientHttpRequestFactory simpleClientHttpRequestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(50); // 连接到主机 超时时间
        factory.setReadTimeout(50); // 从主机读取数据 超时时间
        return factory;
    }
}
