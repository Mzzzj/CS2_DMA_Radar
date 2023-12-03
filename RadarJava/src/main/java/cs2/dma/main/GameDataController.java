package cs2.dma.main;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GameDataController {



    @GetMapping("/setShowTeam")
    public String setShowTeam(@RequestParam boolean showTeam){
        GameViewController.showTeam=showTeam;
        return "";
    }

    @GetMapping("/setRotateMap")
    public String setRotateMap(@RequestParam boolean rotateMap){
        GameViewController.rotateMap=rotateMap;
        return "";
    }
}
