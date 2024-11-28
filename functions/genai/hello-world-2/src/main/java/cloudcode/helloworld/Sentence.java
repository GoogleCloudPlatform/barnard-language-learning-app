package cloudcode.helloworld;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Sentence {

    private String model;
    private String word;
    private String primaryLanguage;
    private String TargetLanguage;
    private String sentence;
    private String replaced_word;
}
