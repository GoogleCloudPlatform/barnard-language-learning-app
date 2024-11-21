package cloudcode.helloworld;

import com.google.cloud.functions.HttpFunction;
import com.google.cloud.functions.HttpRequest;
import com.google.cloud.functions.HttpResponse;
import com.google.gson.Gson;

public class HelloWorld implements HttpFunction {
  @Override
  public void service(HttpRequest request, HttpResponse response) throws Exception {
    response.appendHeader("Access-Control-Allow-Origin", "*");

    if ("OPTIONS".equals(request.getMethod())) {
      response.appendHeader("Access-Control-Allow-Methods", "GET");
      response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
      response.appendHeader("Access-Control-Max-Age", "3600");
      response.setStatusCode(204);
      return;
    }
    Gson gson = new Gson();
    Sentence sentence = gson.fromJson(request.getReader(), Sentence.class);
    MultiModal multiModal = new MultiModal();
    Sentence s = multiModal.generateSentence(sentence.getPrimaryLanguage(), sentence.getTargetLanguage(),
        sentence.getWord());
    sentence.setSentence(s.getSentence());
    sentence.setReplaced_word(s.getReplaced_word());
    sentence.setModel(MultiModal.GEMINI_MODEL);
    response.setContentType("application/json; charset=UTF-8");

    response.getWriter().write(gson.toJson(s));
  }

}
