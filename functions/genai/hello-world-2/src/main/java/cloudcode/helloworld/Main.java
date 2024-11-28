package cloudcode.helloworld;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutionException;

import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.api.GenerationConfig;
import com.google.cloud.vertexai.api.HarmCategory;
import com.google.cloud.vertexai.api.SafetySetting;
import com.google.cloud.vertexai.generativeai.ContentMaker;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.cloud.vertexai.generativeai.ResponseStream;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class Main {

        public static void main(String[] args) throws IOException, InterruptedException, ExecutionException {
                MultiModal multiModal = new MultiModal();

                Sentence s = multiModal.generateSentence("fr", "प्रीतः",
                                "trottinette");
                System.out.println(s);
                GsonBuilder builder = new GsonBuilder().disableHtmlEscaping();
                Gson gson = builder.create();
                System.out.println("");
                System.out.println(gson.toJson(s));

        }

        public static void test(String[] args) throws IOException {
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
                        GenerativeModel model = new GenerativeModel.Builder()
                                        .setModelName("gemini-1.5-flash-001")
                                        .setVertexAi(vertexAi)
                                        .setGenerationConfig(generationConfig)
                                        .setSafetySettings(safetySettings)
                                        .build();

                        var content = ContentMaker.fromMultiModalData(
                                        "you are a translation chat bot. \nyou will be given a word to translate from input language  to another translation language.\n\nwrite a simple sentence with this word and in the output replace the original input word with the translated word.\n\ninput: input language: %s\ntranslation language: %s \ninput word: %s\nprompt: write a simple sentence with word input word and in the output replace the original input word with the translated word. \noutput: the generated sentence with the replaced word and only this sentence. The output should propose only one sentence written in the primary language and with one word in the translated language. Please do not add any special caracter to mention the tranlsated word\n");
                        ResponseStream<GenerateContentResponse> responseStream = model.generateContentStream(content);

                        // Do something with the response
                        responseStream.stream().forEach(System.out::println);
                }
        }
}
