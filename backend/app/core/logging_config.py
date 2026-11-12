import logging
import sys
from loguru import logger


class InterceptHandler(logging.Handler):
    """
    DOM-05: Meneruskan pesan logging standar pustaka Python ke Loguru
    dengan format terstruktur dan proteksi pembocoran secret / kunci API.
    """

    def emit(self, record: logging.LogRecord) -> None:
        # Dapatkan kedalaman frame yang sesuai
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        msg = record.getMessage()
        # Filter penyamaran API Key / Credentials
        if "api_key" in msg.lower() or "secret" in msg.lower():
            import re
            msg = re.sub(r"(key|token|secret)[\s:=]+['\"]?([a-zA-Z0-9_\-]{8,})['\"]?", r"\1=***", msg, flags=re.I)

        logger.opt(depth=depth, exception=record.exc_info).log(level, msg)


def setup_app_logging() -> None:
    """Inisialisasi handler Loguru untuk aplikasi backend WASKITA."""
    logging.root.handlers = [InterceptHandler()]
    logging.root.setLevel(logging.INFO)

    for name in logging.root.manager.loggerDict.keys():
        logging.getLogger(name).handlers = []
        logging.getLogger(name).propagate = True

    # Konfigurasi sink konsol Loguru
    logger.remove()
    logger.add(
        sys.stderr,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO",
    )
    # File rotation untuk audit produksi
    logger.add(
        "backend/logs/waskita_{time:YYYY-MM-DD}.log",
        rotation="10 MB",
        retention="14 days",
        compression="zip",
        level="INFO",
        enqueue=True,
    )
