package cloudcode.helloworld;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutionException;

import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.Candidate;
import com.google.cloud.vertexai.api.GenerationConfig;
import com.google.cloud.vertexai.api.HarmCategory;
import com.google.cloud.vertexai.api.SafetySetting;
import com.google.cloud.vertexai.generativeai.ContentMaker;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.gson.Gson;

public class MultiModal {

        // public static final String TEMPLATE_STRING = "you are a translation chat bot.
        // \nyou will be given a word to translate from input language to another
        // translation language.\n\nwrite a simple sentence with this word and in the
        // output replace the original input word with the translated word.\n\ninput:
        // input language: %s\ntranslation language: %s \ninput word: %s\nprompt: write
        // a simple sentence with word input word and in the output replace the original
        // input word with the translated word. Use latin alphabet only. print the
        // output as json format, not markdown \noutput: {\n\"translated_word\": \"\",
        // \n\"sentence\" : \"\"\n}\n\ninput: input language: %s\nTranslation language:
        // %s \nInput word: %s\noutput:\n";

        public static final String TEMPLATE_STRING = "you are a  chat bot that generate random sentence containing a given word. \nyou will be given a word to translate from input language  to another translation language.\n\nwrite a simple sentence with this word and in the output replace the original input word with the translated word.\n\ninput: input language: %s\ntranslation language: %s \ninput word: %s\nprompt: write a simple sentence with word input word and in the output replace the original input word with the translated word. Use latin alphabet only. print the output as json format, not markdown \noutput: {\n\"translated_word\": \"\", \n\"sentence\" : \"\"\n}\n\ninput: input language: %s\nTranslation language: %s \nInput word: %s\noutput:\n";

        public static final String INSTRUCTION = """
                         You are a chat bot that generate random sentence in a given language (field primaryLanguage) containing one given word ( field word).
                         Then, in the generated sentence, replace the given word by the replaced word that will be given to you ( field replaced_word).
                        """;

        public static final String EXAMPLE_TEMPLATE = """
                        input: {
                                \"model\": \"gemini-1.5-flash-001\",
                                \"word\": \"chat\",
                                \"primaryLanguage\": \"en\",
                                \"replaced_word\": \"bavarder\"
                            }
                            output: {\"sentence\":\"I like to bavarder with my friends.\", replaced_word: \"bavarder\"}


                            input: {
                                \"model\": \"gemini-1.5-flash-001\",
                                \"word\": \"%s\",
                                \"primaryLanguage\": \"%s\",
                                \"replaced_word\": \"%s\"
                            }
                            output:""";

        private String getTemplate(String inputLanguage, String translatedWord, String inputWord) {
                return INSTRUCTION + "\n"
                                + String.format(EXAMPLE_TEMPLATE, inputWord, inputLanguage, translatedWord);
        }

        public static final String GEMINI_MODEL = System.getenv().get("GEMINI_MODE");
        public static final String GEMINI_PROJECT = System.getenv().get("GEMINI_PROJECT");
        public static final String GEMINI_REGION = System.getenv().get("GEMINI_REGION");

        private GenerativeModel model;

        public Sentence generateSentence(String inputLanguage, String translatedWord, String inputWord)
                        throws InterruptedException, ExecutionException, IOException {
                try (VertexAI vertexAi = new VertexAI("civil-victory-381915", "us-central1");) {
                        GenerationConfig generationConfig = GenerationConfig.newBuilder()
                                        .setMaxOutputTokens(8192)
                                        .setTemperature(1F)
                                        .setTopP(0.95F)
                                        .build();
                        List<SafetySetting> safetySettings = Arrays.asList(
                                        SafetySetting.newBuilder()
                                                        .setCategory(HarmCategory.HARM_CATEGORY_HATE_SPEECH)
                                                        .setThreshold(SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE)
                                                        .build(),
                                        SafetySetting.newBuilder()
                                                        .setCategory(HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT)
                                                        .setThreshold(SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE)
                                                        .build(),
                                        SafetySetting.newBuilder()
                                                        .setCategory(HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT)
                                                        .setThreshold(SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE)
                                                        .build(),
                                        SafetySetting.newBuilder()
                                                        .setCategory(HarmCategory.HARM_CATEGORY_HARASSMENT)
                                                        .setThreshold(SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE)
                                                        .build());
                        model = new GenerativeModel.Builder()
                                        .setModelName("gemini-1.5-flash-001")
                                        .setVertexAi(vertexAi)
                                        .setGenerationConfig(generationConfig)
                                        .setSafetySettings(safetySettings)
                                        .build();

                        var content = ContentMaker
                                        .fromMultiModalData(getTemplate(inputLanguage, translatedWord, inputWord));

                        List<Candidate> cs = model.generateContentAsync(content).get().getCandidatesList();
                        if (cs != null && !cs.isEmpty() && cs.get(0).getContent() != null
                                        && !cs.get(0).getContent().getPartsList().isEmpty()) {
                                Gson gson = new Gson();

                                String s = cs.get(0).getContent().getParts(0).getText().replace("```json", "")
                                                .replace("```", "");
                                Sentence sentence = gson.fromJson(s, Sentence.class);
                                return sentence;

                        }

                        return Sentence.builder().sentence("no sentence generated")
                                        .replaced_word("no transleted word").build();
                }
                // ResponseStream<GenerateContentResponse> responseStream =
                // model.generateContentStream(content);
                // return responseStream.stream().map(c ->
                // c.toString()).collect(Collectors.joining("\n"));
        }

}